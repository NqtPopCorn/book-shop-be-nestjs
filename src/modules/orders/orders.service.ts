import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}
  async create(userId: number, dto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      const ids = dto.items.map((item) => item.bookId);
      const books = await tx.book.findMany({ where: { id: { in: ids } } });
      if (books.length !== ids.length) throw new NotFoundException('One or more books not found');
      const byId = new Map(books.map((book) => [book.id, book]));
      let total = 0;
      const items = dto.items.map((item) => {
        const book = byId.get(item.bookId)!;
        if (book.stock < item.quantity) throw new BadRequestException(`Insufficient stock for book ${book.id}`);
        total += Number(book.price) * item.quantity;
        return { bookId: book.id, quantity: item.quantity, unitPrice: book.price };
      });
      for (const item of dto.items) await tx.book.update({ where: { id: item.bookId }, data: { stock: { decrement: item.quantity } } });
      return tx.order.create({ data: { userId, total, items: { create: items } }, include: { items: { include: { book: true } } } });
    });
  }
  findMine(userId: number) { return this.prisma.order.findMany({ where: { userId }, include: { items: { include: { book: true } } }, orderBy: { createdAt: 'desc' } }); }
  async findOne(userId: number, id: number) { const order = await this.prisma.order.findFirst({ where: { id, userId }, include: { items: { include: { book: true } } } }); if (!order) throw new NotFoundException('Order not found'); return order; }
  async cancel(userId: number, id: number) { return this.prisma.$transaction(async (tx) => { const order = await tx.order.findFirst({ where: { id, userId }, include: { items: true } }); if (!order) throw new NotFoundException('Order not found'); if (order.status !== 'PENDING') throw new BadRequestException('Only pending orders can be cancelled'); for (const item of order.items) await tx.book.update({ where: { id: item.bookId }, data: { stock: { increment: item.quantity } } }); return tx.order.update({ where: { id }, data: { status: 'CANCELLED' }, include: { items: true } }); }); }
}
