import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}
  @Post() create(@Req() req: { user: { id: number } }, @Body() dto: CreateOrderDto) { return this.service.create(req.user.id, dto); }
  @Get('mine') mine(@Req() req: { user: { id: number } }) { return this.service.findMine(req.user.id); }
  @Get(':id') findOne(@Req() req: { user: { id: number } }, @Param('id', ParseIntPipe) id: number) { return this.service.findOne(req.user.id, id); }
}
