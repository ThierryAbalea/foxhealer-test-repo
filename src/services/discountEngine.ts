import type { CustomerProfile, Order, PromotionRules } from '../domain/models.js';

export interface DiscountComputation {
  orderId: string;
  grossTotal: number;
  discountRate: number;
  discountAmount: number;
  finalTotal: number;
  messages: string[];
}

const cents = (value: number): number => Math.round(value * 100) / 100;

const calculateSeasonalShare = (order: Order, category: Order['items'][number]['category']): number => {
  return order.items
    .filter((item) => item.category === category)
    .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
};

const calculateGrossTotal = (order: Order): number => {
  return order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
};

export const calculateDiscountedTotal = (
  order: Order,
  customer: CustomerProfile,
  rules: PromotionRules,
  referenceDate: Date = new Date(),
): DiscountComputation => {
  if (!order.items.length) {
    return {
      orderId: order.id,
      grossTotal: 0,
      discountRate: 0,
      discountAmount: 0,
      finalTotal: 0,
      messages: ['Empty order received'],
    };
  }

  const grossTotal = calculateGrossTotal(order);
  const messages: string[] = [];

  let discountRate = rules.loyaltyDiscounts[customer.loyaltyTier] ?? 0;
  messages.push(`Applied loyalty tier ${customer.loyaltyTier} base discount.`);

  if (customer.firstPurchase) {
    discountRate += rules.firstPurchaseBonus;
    messages.push('First purchase bonus applied.');
  }

  if (customer.churnRisk === 'high') {
    discountRate += rules.churnRecoveryBoost;
    messages.push('Churn recovery boost because customer is high risk.');
  }

  const seasonalShare = calculateSeasonalShare(order, rules.seasonalCategory);
  if (seasonalShare > 0) {
    const seasonalRate = (seasonalShare / grossTotal) * rules.seasonalDiscount;
    discountRate += seasonalRate;
    messages.push(`Seasonal discount applied to ${rules.seasonalCategory} items.`);
  }

  const seasonalItemCount = order.items.filter((item) => item.category === rules.seasonalCategory).length;
  const seasonalRatio = seasonalItemCount / order.items.length;
  if (customer.churnRisk === 'high' && seasonalRatio >= 0.4) {
    discountRate += 0.03;
    messages.push('High-risk seasonal uplift applied.');
  }

  const isWeekend = [0, 6].includes(referenceDate.getUTCDay());
  if (isWeekend && customer.loyaltyTier !== 'gold') {
    discountRate += 0.02;
    messages.push('Weekend boost applied for non-gold customer.');
  }

  const cappedDiscountRate = Math.min(discountRate, rules.maxDiscountRate);
  if (cappedDiscountRate !== discountRate) {
    messages.push('Discount capped by promotion rules.');
  }

  const discountAmount = cents(grossTotal * cappedDiscountRate);
  const finalTotal = cents(grossTotal - discountAmount);

  return {
    orderId: order.id,
    grossTotal: cents(grossTotal),
    discountRate: Number(cappedDiscountRate.toFixed(4)),
    discountAmount,
    finalTotal,
    messages,
  };
};
