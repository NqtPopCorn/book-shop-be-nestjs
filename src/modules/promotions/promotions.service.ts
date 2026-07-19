import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreatePromotionDto } from "./dto/create-promotion.dto";
import { PromotionRuleService } from "./promotion-rule.service";

@Injectable()
export class PromotionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ruleService: PromotionRuleService,
  ) {}

  create(dto: CreatePromotionDto) {
    return this.prisma.promotion.create({
      data: {
        ...dto,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        conditions: dto.conditions as any,
        actions: dto.actions as any,
      },
    });
  }

  findAll() {
    return this.prisma.promotion.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findOne(id: number) {
    const p = await this.prisma.promotion.findUnique({ where: { id } });
    if (!p) throw new NotFoundException("Mã khuyến mãi không tồn tại");
    return p;
  }

  async checkCode(code: string) {
    const p = await this.prisma.promotion.findUnique({ where: { code } });
    if (!p) throw new NotFoundException("Mã khuyến mãi không tồn tại");
    if (!p.active) throw new BadRequestException("Mã khuyến mãi đã bị khoá");
    if (p.expiresAt && p.expiresAt < new Date())
      throw new BadRequestException("Mã khuyến mãi đã hết hạn");
    if (p.maxUses && p.usedCount >= p.maxUses)
      throw new BadRequestException("Mã khuyến mãi đã hết lượt sử dụng");

    return p;
  }

  update(id: number, data: any) {
    return this.prisma.promotion.update({
      where: { id },
      data: {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        conditions: data.conditions,
        actions: data.actions,
      },
    });
  }

  remove(id: number) {
    return this.prisma.promotion.delete({ where: { id } });
  }
}
