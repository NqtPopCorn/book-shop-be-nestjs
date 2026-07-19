import { Injectable } from '@nestjs/common';
import { Engine } from 'json-rules-engine';
import { Promotion } from '@prisma/client';

@Injectable()
export class PromotionRuleService {
  /**
   * Evaluate a cart against a promotion's rules.
   * Returns the discount actions if the rules pass, or null otherwise.
   */
  async evaluateCart(promotion: Promotion, cartFacts: Record<string, any>) {
    if (!promotion.conditions || !promotion.actions) {
      // Legacy promotion without rules, assume it applies based on percentage
      if (promotion.percentage) {
        return { type: 'order_percentage', value: promotion.percentage };
      }
      return null;
    }

    const engine = new Engine();
    
    // Add the rule
    engine.addRule({
      conditions: promotion.conditions as any,
      event: {
        type: 'promotion_matched',
        params: promotion.actions as any,
      },
    });

    // Run the engine
    const { events } = await engine.run(cartFacts);
    
    if (events.length > 0) {
      return events[0].params; // Return the actions
    }

    return null;
  }
}
