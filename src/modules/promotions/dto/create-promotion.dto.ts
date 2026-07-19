import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
export class CreatePromotionDto {
  @IsString() code!: string;
  @IsOptional() @IsInt() @Min(1) @Max(100) percentage?: number;
  @IsOptional() conditions?: any;
  @IsOptional() actions?: any;
  @IsOptional() @IsInt() @Min(1) maxUses?: number;
  @IsOptional() @IsDateString() expiresAt?: string;
}
