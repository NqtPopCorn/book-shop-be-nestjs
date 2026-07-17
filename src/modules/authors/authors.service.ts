import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

@Injectable()
export class AuthorsService {
  constructor(private readonly prisma: PrismaService) {}
  create(dto: CreateAuthorDto) { return this.prisma.author.create({ data: dto }); }
  findAll() { return this.prisma.author.findMany({ include: { books: true }, orderBy: { name: 'asc' } }); }
  async findOne(id: number) { const author = await this.prisma.author.findUnique({ where: { id }, include: { books: true } }); if (!author) throw new NotFoundException('Author not found'); return author; }
  async update(id: number, dto: UpdateAuthorDto) { await this.findOne(id); return this.prisma.author.update({ where: { id }, data: dto }); }
  async remove(id: number) { await this.findOne(id); return this.prisma.author.delete({ where: { id } }); }
}
