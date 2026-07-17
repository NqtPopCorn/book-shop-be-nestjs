import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}
  async overview() {
    const [orders, revenue, booksSold] = await Promise.all([
      this.prisma.order.count({ where: { status: { not: 'CANCELLED' } } }),
      this.prisma.order.aggregate({ where: { status: { not: 'CANCELLED' } }, _sum: { total: true } }),
      this.prisma.orderItem.aggregate({ _sum: { quantity: true } }),
    ]);
    return { orders, revenue: revenue._sum.total ?? 0, booksSold: booksSold._sum.quantity ?? 0 };
  }
}
