import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}
  create(dto: CreateBookDto) { return this.prisma.book.create({ data: { ...dto, price: dto.price } }); }
  findAll(search?: string) { return this.prisma.book.findMany({ where: search ? { title: { contains: search, mode: 'insensitive' } } : undefined, include: { author: true }, orderBy: { createdAt: 'desc' } }); }
  async findOne(id: number) { const book = await this.prisma.book.findUnique({ where: { id }, include: { author: true } }); if (!book) throw new NotFoundException('Book not found'); return book; }
  async update(id: number, dto: UpdateBookDto) { await this.findOne(id); return this.prisma.book.update({ where: { id }, data: dto }); }
  async remove(id: number) { await this.findOne(id); return this.prisma.book.delete({ where: { id } }); }
}
