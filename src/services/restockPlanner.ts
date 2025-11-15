import type { RestockPolicy } from '../domain/models.js';

const average = (values: number[]): number => {
  if (!values.length) {
    return 0;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
};

const calculateTrend = (values: number[]): number => {
  if (values.length < 2) {
    return 0;
  }
  const first = values[0];
  const last = values[values.length - 1];
  return (last - first) / values.length;
};

export interface RestockRecommendation {
  forecastWindow: number;
  forecastDemand: number;
  recommendedOrder: number;
}

export const recommendRestockQuantity = (
  salesHistory: number[],
  pendingOrders: number,
  leadTimeDays: number,
  policy: RestockPolicy,
): RestockRecommendation => {
  if (leadTimeDays <= 0) {
    throw new Error('leadTimeDays must be positive');
  }

  const recentWindow = Math.max(3, leadTimeDays);
  const relevantHistory = salesHistory.slice(-recentWindow);

  const baseAverage = average(relevantHistory);
  const trend = calculateTrend(relevantHistory);
  const projectedDaily = baseAverage + Math.max(trend, 0) * 0.5;
  const forecastDemand = Math.max(projectedDaily * leadTimeDays, 0) + pendingOrders;

  const variability = forecastDemand * policy.variabilityRatio;
  const safetyStock = policy.safetyStockDays * baseAverage;
  const recommendedOrder = Math.ceil(forecastDemand + variability + safetyStock);

  return {
    forecastWindow: relevantHistory.length,
    forecastDemand: Math.round(forecastDemand),
    recommendedOrder,
  };
};
