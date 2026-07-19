import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { PromotionRuleService } from "../promotions/promotion-rule.service";

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ruleService: PromotionRuleService,
  ) {}

  async create(userId: number, dto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      const ids = dto.items.map((i) => i.variantId);
      const variants = await tx.bookVariant.findMany({
        where: { id: { in: ids } },
        include: { book: true },
      });
      if (variants.length !== ids.length)
        throw new NotFoundException("One or more variants not found");

      const byId = new Map(variants.map((v) => [v.id, v]));
      let subtotal = 0;

      const items = dto.items.map((i) => {
        const variant = byId.get(i.variantId)!;
        if (variant.stock < i.quantity)
          throw new BadRequestException(
            `Insufficient stock for variant ${variant.id}`,
          );
        subtotal += Number(variant.sellingPrice) * i.quantity;
        return {
          variantId: variant.id,
          quantity: i.quantity,
          unitPrice: variant.sellingPrice,
        };
      });

      let discount = 0;
      let promotionId: number | undefined;

      if (dto.promotionCode) {
        const p = await tx.promotion.findUnique({
          where: { code: dto.promotionCode },
        });
        if (
          !p ||
          !p.active ||
          (p.expiresAt && p.expiresAt < new Date()) ||
          (p.maxUses && p.usedCount >= p.maxUses)
        ) {
          throw new BadRequestException("Invalid or expired promotion");
        }

        // Use PromotionRuleService
        const cartFacts = {
          subtotal,
          itemCount: dto.items.reduce((acc, i) => acc + i.quantity, 0),
          items: items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
            unitPrice: Number(i.unitPrice),
          })),
        };

        const action = await this.ruleService.evaluateCart(p as any, cartFacts);
        if (action) {
          if (action.type === "order_percentage") {
            discount = (subtotal * action.value) / 100;
          } else if (action.type === "order_fixed") {
            discount = action.value;
          } else if (action.type === "line_item_percentage") {
            // value contains variantIds (array) and percentage
            const variantIds = action.value.variantIds || [];
            const percentage = action.value.percentage || 0;

            let itemDiscount = 0;
            for (const targetItem of items) {
              if (variantIds.includes(targetItem.variantId)) {
                itemDiscount +=
                  (Number(targetItem.unitPrice) *
                    targetItem.quantity *
                    percentage) /
                  100;
              }
            }
            discount = itemDiscount;
          }
        } else {
          throw new BadRequestException(
            "Promotion rules do not match the current cart",
          );
        }

        promotionId = p.id;
        await tx.promotion.update({
          where: { id: p.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      for (const i of dto.items) {
        await tx.bookVariant.update({
          where: { id: i.variantId },
          data: { stock: { decrement: i.quantity } },
        });
      }

      return tx.order.create({
        data: {
          userId,
          total: subtotal - discount,
          ...(promotionId ? { promotionId } : {}),
          items: { create: items },
        },
        include: {
          items: { include: { variant: { include: { book: true } } } },
          promotion: true,
        },
      });
    });
  }

  async findMine(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { variant: { include: { book: true } } } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(userId: number, orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { variant: { include: { book: true } } } },
        promotion: true,
      },
    });
    if (!order || order.userId !== userId)
      throw new NotFoundException("Order not found");
    return order;
  }

  async cancel(userId: number, orderId: number) {
    const order = await this.findOne(userId, orderId);
    if (order.status !== "PENDING")
      throw new BadRequestException("Cannot cancel order");

    return this.prisma.$transaction(async (tx) => {
      // Restore stock
      for (const item of order.items) {
        await tx.bookVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }
      return tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });
    });
  }
}
