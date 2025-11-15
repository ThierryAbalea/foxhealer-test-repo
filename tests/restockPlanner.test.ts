import { describe, expect, it } from 'vitest';
import { recommendRestockQuantity } from '../src/index.js';

const policy = {
  variabilityRatio: 0.25,
  safetyStockDays: 2,
};

describe('recommendRestockQuantity', () => {
  it('increases recommendation when sales trend upwards', () => {
    const history = [10, 12, 14, 18, 22, 26, 30];
    const result = recommendRestockQuantity(history, 15, 5, policy);

    expect(result.forecastWindow).toBe(5);
    expect(result.forecastDemand).toBeGreaterThan(120);
    expect(result.recommendedOrder).toBeGreaterThan(result.forecastDemand);
  });

  it('throws when lead time is invalid', () => {
    expect(() => recommendRestockQuantity([5, 4, 6], 0, 0, policy)).toThrowError('leadTimeDays must be positive');
  });
});
