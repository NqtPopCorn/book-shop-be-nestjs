import { IsDateString, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
export class CreatePromotionDto { @IsString() code!: string; @IsInt() @Min(1) @Max(100) percentage!: number; @IsOptional() @IsInt() @Min(1) maxUses?: number; @IsOptional() @IsDateString() expiresAt?: string; }
