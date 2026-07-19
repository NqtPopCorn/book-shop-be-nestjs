import { IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";
export class CreateBookDto {
  @IsString() title!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() isbn?: string;
  @IsNumber() @Min(0) price!: number;
  @IsOptional() @IsInt() @Min(0) stock?: number;
  @IsOptional() @IsInt() authorId?: number;
}
