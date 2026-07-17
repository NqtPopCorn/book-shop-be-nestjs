import { Type } from 'class-transformer';
import { ArrayMinSize, IsInt, Min, ValidateNested } from 'class-validator';
export class OrderItemDto { @IsInt() @Min(1) bookId!: number; @IsInt() @Min(1) quantity!: number; }
export class CreateOrderDto { @ValidateNested({ each: true }) @Type(() => OrderItemDto) @ArrayMinSize(1) items!: OrderItemDto[]; }
