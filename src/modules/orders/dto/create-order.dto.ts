import { IsInt, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";
export class OrderItemDto {
  @IsInt() @Min(1) variantId!: number;
  @IsInt() @Min(1) quantity!: number;
}
export class CreateOrderDto {
  @Type(() => OrderItemDto) items!: OrderItemDto[];
  @IsOptional() @IsString() promotionCode?: string;
}
