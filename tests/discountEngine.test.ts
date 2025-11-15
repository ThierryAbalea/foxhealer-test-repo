import { describe, expect, it } from 'vitest';
import type { CustomerProfile, Order, PromotionRules } from '../src/index.js';
import { calculateDiscountedTotal } from '../src/index.js';

const baseRules: PromotionRules = {
  seasonalCategory: 'seasonal',
  seasonalDiscount: 0.08,
  loyaltyDiscounts: {
    bronze: 0.01,
    silver: 0.03,
    gold: 0.05,
  },
  firstPurchaseBonus: 0.08,
  churnRecoveryBoost: 0.12,
  maxDiscountRate: 0.25,
};

const sampleOrder: Order = {
  id: 'order-1',
  createdAt: new Date('2024-01-26T10:00:00Z'),
  items: [
    { sku: 'abc', quantity: 2, unitPrice: 50, category: 'everyday' },
    { sku: 'season-1', quantity: 1, unitPrice: 120, category: 'seasonal' },
  ],
};

const profile: CustomerProfile = {
  id: 'cust-1',
  loyaltyTier: 'silver',
  firstPurchase: true,
  churnRisk: 'high',
};

describe('calculateDiscountedTotal', () => {
  it('applies loyalty, first purchase, churn, seasonal and weekend boosts', () => {
    const result = calculateDiscountedTotal(sampleOrder, profile, baseRules, new Date('2024-01-27T12:00:00Z'));

    expect(result.discountRate).toBeCloseTo(0.25, 2); // capped
    expect(result.discountAmount).toBeCloseTo(55, 0);
    expect(result.finalTotal).toBeCloseTo(165, 0);
    expect(result.messages).toContain('Discount capped by promotion rules.');
  });

  it('handles non-seasonal orders without bonuses', () => {
    const order: Order = {
      ...sampleOrder,
      id: 'order-2',
      items: sampleOrder.items.filter((item) => item.category !== 'seasonal'),
    };
    const loyalCustomer: CustomerProfile = {
      ...profile,
      loyaltyTier: 'gold',
      firstPurchase: false,
      churnRisk: 'low',
    };

    const result = calculateDiscountedTotal(order, loyalCustomer, baseRules, new Date('2024-01-24T10:00:00Z'));

    expect(result.discountRate).toBeCloseTo(0.05, 2);
    expect(result.finalTotal).toBeCloseTo(95, 0);
    expect(result.messages).not.toContain('Discount capped by promotion rules.');
  });
});
