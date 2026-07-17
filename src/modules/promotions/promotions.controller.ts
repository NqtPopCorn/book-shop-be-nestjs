import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
@ApiTags('promotions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('promotions')
export class PromotionsController { constructor(private readonly service: PromotionsService) {} @Post() create(@Body() dto: CreatePromotionDto) { return this.service.create(dto); } @Get() findAll() { return this.service.findAll(); } }
