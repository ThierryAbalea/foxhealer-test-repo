export type LoyaltyTier = 'bronze' | 'silver' | 'gold';

export interface LineItem {
  sku: string;
  quantity: number;
  unitPrice: number;
  category: 'everyday' | 'seasonal' | 'clearance';
}

export interface Order {
  id: string;
  items: LineItem[];
  createdAt: Date;
}

export interface CustomerProfile {
  id: string;
  loyaltyTier: LoyaltyTier;
  firstPurchase: boolean;
  churnRisk: 'low' | 'medium' | 'high';
}

export interface PromotionRules {
  seasonalCategory: LineItem['category'];
  seasonalDiscount: number; // 0-1 range
  loyaltyDiscounts: Record<LoyaltyTier, number>;
  firstPurchaseBonus: number; // 0-1 range
  churnRecoveryBoost: number; // 0-1 range
  maxDiscountRate: number; // 0-1 range
}

export interface WarehouseAvailability {
  warehouseId: string;
  coverageRegion: string;
  inventory: Record<string, number>; // sku -> quantity
  temperatureControlled: boolean;
}

export interface RestockPolicy {
  variabilityRatio: number; // cushion applied to demand forecast
  safetyStockDays: number;
}
