import { Expose } from 'class-transformer';

export class CartItemResponseDto {
  @Expose()
  id: string;

  @Expose()
  serviceId: string;

  @Expose()
  serviceTitle?: string | null;

  @Expose()
  serviceSlug?: string | null;

  @Expose()
  serviceIconUrl?: string | null;

  @Expose()
  serviceImageUrl?: string | null;

  @Expose()
  quantity: number;

  @Expose()
  unitPrice: number;

  @Expose()
  subtotal: number;
}

export class CartResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId: number;

  @Expose()
  items: CartItemResponseDto[];

  @Expose()
  totalItems: number;

  @Expose()
  totalAmount: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
