import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Cart } from './schema/cart.schema';
import { CartItem } from './schema/cart-item.schema';
import { Service } from '../services/schema/service.schema';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto, CartItemResponseDto } from './dto/cart-response.dto';
import { GuestCartItemDto } from './dto/merge-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  /**
   * Gets or creates a cart for a user.
   */
  async getOrCreateCart(userId: number): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.service'],
    });

    if (!cart) {
      cart = this.cartRepository.create({
        userId,
        items: [],
        totalAmount: 0,
      });
      cart = await this.cartRepository.save(cart);
    }

    return cart;
  }

  /**
   * Get cart for a specific user.
   */
  async getCart(userId: number): Promise<CartResponseDto> {
    const cart = await this.getOrCreateCart(userId);
    return this.toCartResponse(cart);
  }

  /**
   * Add item to cart or update quantity if already exists.
   */
  async addItem(userId: number, dto: AddCartItemDto): Promise<CartResponseDto> {
    // Verify service exists
    const service = await this.serviceRepository.findOne({
      where: { id: dto.serviceId },
      select: ['id', 'title', 'slug', 'basePrice', 'iconUrl', 'coverImageUrl'],
    });

    if (!service) {
      throw new NotFoundException(
        `Service with ID "${dto.serviceId}" not found`,
      );
    }

    // Get or create cart
    const cart = await this.getOrCreateCart(userId);

    // Check if item already in cart
    const existingItem = await this.cartItemRepository.findOne({
      where: { cartId: cart.id, serviceId: dto.serviceId },
      relations: ['service'],
    });

    if (existingItem) {
      // Update quantity and refresh price if it was 0
      const unitPrice = Number(service.basePrice) || 0;
      const newQuantity = (existingItem.quantity || 1) + (dto.quantity || 1);

      existingItem.unitPrice = unitPrice;
      existingItem.quantity = newQuantity;
      existingItem.subtotal = unitPrice * newQuantity;
      await this.cartItemRepository.save(existingItem);
    } else {
      // Create new cart item
      const unitPrice = Number(service.basePrice) || 0;

      const newItem = this.cartItemRepository.create({
        cartId: cart.id,
        serviceId: dto.serviceId,
        quantity: dto.quantity || 1,
        unitPrice,
        subtotal: unitPrice * (dto.quantity || 1),
        service,
      });
      await this.cartItemRepository.save(newItem);
    }

    // Recalculate cart total
    await this.recalculateCartTotal(cart.id);

    // Return updated cart
    const updatedCart = await this.cartRepository.findOne({
      where: { id: cart.id },
      relations: ['items', 'items.service'],
    });

    if (!updatedCart) {
      throw new NotFoundException('Cart not found');
    }

    return this.toCartResponse(updatedCart);
  }

  /**
   * Update item quantity in cart.
   */
  async updateItem(
    userId: number,
    itemId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const cart = await this.getOrCreateCart(userId);

    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId, cartId: cart.id },
      relations: ['service'],
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID "${itemId}" not found`);
    }

    if (dto.quantity !== undefined) {
      if (dto.quantity < 1) {
        throw new BadRequestException('Quantity must be at least 1');
      }

      // Refresh price from service if it's currently 0
      if (Number(cartItem.unitPrice) === 0 && cartItem.service) {
        cartItem.unitPrice = Number(cartItem.service.basePrice) || 0;
      }

      cartItem.quantity = dto.quantity;
      cartItem.subtotal = Number(cartItem.unitPrice) * dto.quantity;
      await this.cartItemRepository.save(cartItem);
    }

    // Recalculate cart total
    await this.recalculateCartTotal(cart.id);

    // Return updated cart
    const updatedCart = await this.cartRepository.findOne({
      where: { id: cart.id },
      relations: ['items', 'items.service'],
    });

    if (!updatedCart) {
      throw new NotFoundException('Cart not found');
    }

    return this.toCartResponse(updatedCart);
  }

  /**
   * Remove item from cart.
   */
  async removeItem(userId: number, itemId: string): Promise<CartResponseDto> {
    const cart = await this.getOrCreateCart(userId);

    const cartItem = await this.cartItemRepository.findOne({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID "${itemId}" not found`);
    }

    await this.cartItemRepository.remove(cartItem);

    await this.recalculateCartTotal(cart.id);

    const updatedCart = await this.cartRepository.findOne({
      where: { id: cart.id },
      relations: ['items', 'items.service'],
    });

    if (!updatedCart) {
      throw new NotFoundException('Cart not found');
    }

    if (
      updatedCart.items.length === 0 ||
      Number(updatedCart.totalAmount) === 0
    ) {
      await this.cartRepository.delete(updatedCart.id);

      return {
        id: '0',
        items: [],
        totalAmount: 0,
        userId: 0,
        totalItems: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return this.toCartResponse(updatedCart);
  }

  /**
   * Clear all items from cart.
   */
  async clearCart(userId: number): Promise<{ message: string }> {
    const cart = await this.cartRepository.findOne({
      where: { userId },
    });

    if (!cart) {
      return { message: 'Cart already empty' };
    }

    await this.cartRepository.delete(cart.id);

    return { message: 'Cart deleted successfully' };
  }

  /**
   * Merge guest cart items with authenticated user's cart.
   *
   * - Validates each service exists and is available
   * - Adds quantities for existing items
   * - Creates new items for non-existing services
   * - Never trusts client prices - fetches from database
   * - Respects maximum quantity limit (99 per item)
   */
  async mergeCart(
    userId: number,
    guestItems: GuestCartItemDto[],
  ): Promise<{
    success: boolean;
    message: string;
    cart: CartResponseDto;
    failedItems: Array<{ serviceId: string; reason: string }>;
  }> {
    const failedItems: Array<{ serviceId: string; reason: string }> = [];
    const MAX_QUANTITY = 99;

    // Get user's existing cart
    const cart = await this.getOrCreateCart(userId);

    // Get all service IDs from guest cart
    const serviceIds = guestItems.map((item) => item.serviceId);

    // Fetch all services from database (to get real prices)
    const services = await this.serviceRepository.find({
      where: { id: In(serviceIds) },
    });

    // Create a map for quick lookup
    const serviceMap = new Map(services.map((s) => [s.id, s]));

    // Get existing cart items for quick lookup
    const existingCartItems = await this.cartItemRepository.find({
      where: { cartId: cart.id },
    });
    const cartItemMap = new Map(
      existingCartItems.map((item) => [item.serviceId, item]),
    );

    // Process each guest item
    for (const guestItem of guestItems) {
      const service = serviceMap.get(guestItem.serviceId);

      // Validate service exists
      if (!service) {
        failedItems.push({
          serviceId: guestItem.serviceId,
          reason: 'Service not found or unavailable',
        });
        continue;
      }

      // Get the real price from database (never trust client)
      const unitPrice = Number(service.basePrice) || 0;

      // Check if item already exists in cart
      const existingCartItem = cartItemMap.get(guestItem.serviceId);

      if (existingCartItem) {
        // Add guest quantity to existing quantity
        const newQuantity = existingCartItem.quantity + guestItem.quantity;

        // Check max quantity limit
        if (newQuantity > MAX_QUANTITY) {
          failedItems.push({
            serviceId: guestItem.serviceId,
            reason: `Maximum quantity limit (${MAX_QUANTITY}) exceeded`,
          });
          continue;
        }

        existingCartItem.quantity = newQuantity;
        existingCartItem.subtotal = unitPrice * newQuantity;
        await this.cartItemRepository.save(existingCartItem);
      } else {
        // Create new cart item
        // Check max quantity limit for new item
        if (guestItem.quantity > MAX_QUANTITY) {
          failedItems.push({
            serviceId: guestItem.serviceId,
            reason: `Maximum quantity limit (${MAX_QUANTITY}) exceeded`,
          });
          continue;
        }

        const newItem = this.cartItemRepository.create({
          cartId: cart.id,
          serviceId: guestItem.serviceId,
          quantity: guestItem.quantity,
          unitPrice,
          subtotal: unitPrice * guestItem.quantity,
          service,
        });
        await this.cartItemRepository.save(newItem);

        // Add to map for potential future updates in this batch
        cartItemMap.set(guestItem.serviceId, newItem);
      }
    }

    // Recalculate cart total after merge
    await this.recalculateCartTotal(cart.id);

    // Get final cart with updated items
    const finalCart = await this.cartRepository.findOne({
      where: { id: cart.id },
      relations: ['items', 'items.service'],
    });

    if (!finalCart) {
      throw new NotFoundException('Cart not found after merge');
    }

    const response = this.toCartResponse(finalCart);

    // Determine message based on result
    let message = 'Cart merged successfully';
    if (failedItems.length > 0 && failedItems.length === guestItems.length) {
      message = 'No items could be merged';
    } else if (failedItems.length > 0) {
      message = `Partially merged: ${guestItems.length - failedItems.length} of ${guestItems.length} items`;
    }

    return {
      success: failedItems.length < guestItems.length,
      message,
      cart: response,
      failedItems,
    };
  }

  /**
   * Recalculate cart total amount.
   */
  private async recalculateCartTotal(cartId: string): Promise<void> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: ['items'],
    });

    if (!cart) return;

    const total = cart.items.reduce(
      (sum, item) => sum + Number(item.subtotal || 0),
      0,
    );

    cart.totalAmount = total;
    await this.cartRepository.save(cart);
  }

  /**
   * Convert Cart entity to CartResponseDto.
   */
  private toCartResponse(cart: Cart): CartResponseDto {
    const items: CartItemResponseDto[] =
      cart.items?.map((item) => ({
        id: item.id,
        serviceId: item.serviceId,
        serviceTitle: item.service?.title,
        serviceSlug: item.service?.slug,
        serviceIconUrl: item.service?.iconUrl,
        serviceImageUrl: item.service?.coverImageUrl,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
      })) || [];

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: cart.id,
      userId: cart.userId,
      items,
      totalItems,
      totalAmount: Number(cart.totalAmount),
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }
}
