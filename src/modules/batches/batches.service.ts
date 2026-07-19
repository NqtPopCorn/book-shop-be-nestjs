import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { code: string; bookId: number; quantity: number }) {
    const batch = await this.prisma.batch.create({
      data: {
        code: data.code,
        bookId: data.bookId,
        quantity: data.quantity,
      }
    });

    // Tăng tồn kho sách
    await this.prisma.book.update({
      where: { id: data.bookId },
      data: { stock: { increment: data.quantity } }
    });

    return batch;
  }

  findAll() {
    return this.prisma.batch.findMany({
      include: { book: { select: { title: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }
}
