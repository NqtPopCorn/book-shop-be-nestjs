import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateAccountDto } from './dto/update-account.dto';
@Injectable()
export class AccountsService { constructor(private readonly prisma: PrismaService) {} async me(id: number) { const user = await this.prisma.user.findUnique({ where: { id }, select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true } }); if (!user) throw new NotFoundException('Account not found'); return user; } update(id: number, dto: UpdateAccountDto) { return this.prisma.user.update({ where: { id }, data: dto, select: { id: true, email: true, firstName: true, lastName: true, role: true } }); } }
