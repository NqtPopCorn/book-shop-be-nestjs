import { Module } from "@nestjs/common";
import { PromotionsController } from "./promotions.controller";
import { PromotionsService } from "./promotions.service";
import { PromotionRuleService } from "./promotion-rule.service";

@Module({
  controllers: [PromotionsController],
  providers: [PromotionsService, PromotionRuleService],
  exports: [PromotionsService, PromotionRuleService],
})
export class PromotionsModule {}
