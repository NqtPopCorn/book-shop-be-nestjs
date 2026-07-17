import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminOrdersService } from './admin-orders.service';
@Module({ controllers: [OrdersController, AdminOrdersController], providers: [OrdersService, AdminOrdersService] })
export class OrdersModule {}
