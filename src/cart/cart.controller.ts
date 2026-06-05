import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { MergeCartDto } from './dto/merge-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/current-user.decorator';
import { User } from '../user/schema/user.schema';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * Get current user's cart.
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user cart' })
  @ApiResponse({
    status: 200,
    description: 'Cart retrieved successfully',
    type: CartResponseDto,
  })
  async getCart(@GetUser() user: User): Promise<CartResponseDto> {
    return this.cartService.getCart(user.id);
  }

  /**
   * Add item to cart.
   */
  @Post('items')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({
    status: 201,
    description: 'Item added to cart',
    type: CartResponseDto,
  })
  async addItem(
    @GetUser() user: User,
    @Body() dto: AddCartItemDto,
  ): Promise<CartResponseDto> {
    return this.cartService.addItem(user.id, dto);
  }

  /**
   * Update cart item quantity.
   */
  @Put('items/:itemId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiResponse({
    status: 200,
    description: 'Item updated successfully',
    type: CartResponseDto,
  })
  async updateItem(
    @GetUser() user: User,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    return this.cartService.updateItem(user.id, itemId, dto);
  }

  /**
   * Remove item from cart.
   */
  @Delete('items/:itemId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({
    status: 200,
    description: 'Item removed successfully',
    type: CartResponseDto,
  })
  async removeItem(
    @GetUser() user: User,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ): Promise<CartResponseDto> {
    return this.cartService.removeItem(user.id, itemId);
  }

  /**
   * Clear cart.
   */
  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Clear cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully' })
  @HttpCode(HttpStatus.OK)
  async clearCart(@GetUser() user: User): Promise<{ message: string }> {
    return this.cartService.clearCart(user.id);
  }

  /**
   * Merge guest cart with authenticated user's cart.
   * Call this endpoint after successful login to merge local cart items.
   */
  @Post('merge')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Merge guest cart with user cart' })
  @ApiResponse({ status: 200, description: 'Cart merged successfully' })
  @ApiConflictResponse({
    description: 'Partial merge with some items failed',
  })
  async mergeCart(@GetUser() user: User, @Body() dto: MergeCartDto) {
    return this.cartService.mergeCart(user.id, dto.items);
  }
}
