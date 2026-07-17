import { IsOptional, IsString, MinLength } from 'class-validator';
export class CreateAuthorDto { @IsString() @MinLength(2) name!: string; @IsOptional() @IsString() biography?: string; }
