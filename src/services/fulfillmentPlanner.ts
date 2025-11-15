import type { LineItem, WarehouseAvailability } from '../domain/models.js';

export interface FulfillmentRecommendation {
  warehouseId: string;
  fillRate: number;
  notes: string[];
}

const requiresColdChain = (items: LineItem[]): boolean =>
  items.some((item) => item.category === 'seasonal');

const canFulfill = (
  warehouse: WarehouseAvailability,
  items: LineItem[],
  temperatureSensitive: boolean,
): boolean => {
  if (temperatureSensitive && !warehouse.temperatureControlled) {
    return false;
  }

  return items.every((item) => {
    const available = warehouse.inventory[item.sku] ?? 0;
    return available >= item.quantity;
  });
};

const calculateFillRate = (warehouse: WarehouseAvailability, items: LineItem[]): number => {
  const totalRequested = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAvailable = items.reduce((sum, item) => {
    const available = warehouse.inventory[item.sku] ?? 0;
    return sum + Math.min(item.quantity, available);
  }, 0);

  if (totalRequested === 0) {
    return 1;
  }

  return totalAvailable / totalRequested;
};

export const recommendWarehouse = (
  orderId: string,
  region: string,
  items: LineItem[],
  warehouses: WarehouseAvailability[],
): FulfillmentRecommendation => {
  const notes: string[] = [];
  const temperatureSensitive = requiresColdChain(items);

  const regionMatches = warehouses.filter((w) => w.coverageRegion === region);
  const candidateWarehouses = regionMatches.length ? regionMatches : warehouses;

  const feasibleWarehouses = candidateWarehouses.filter((warehouse) =>
    canFulfill(warehouse, items, temperatureSensitive),
  );

  if (!feasibleWarehouses.length) {
    notes.push('No warehouse can fully fulfill order, returning best effort option.');
    const fallback = candidateWarehouses
      .map((warehouse) => ({
        warehouse,
        fillRate: calculateFillRate(warehouse, items),
      }))
      .sort((a, b) => b.fillRate - a.fillRate)[0];

    if (!fallback) {
      throw new Error(`No warehouses available for order ${orderId}`);
    }

    return {
      warehouseId: fallback.warehouse.warehouseId,
      fillRate: Number(fallback.fillRate.toFixed(2)),
      notes,
    };
  }

  const ranked = feasibleWarehouses
    .map((warehouse) => {
      const fillRate = calculateFillRate(warehouse, items);
      const slack = items.reduce((total, item) => {
        const available = warehouse.inventory[item.sku] ?? 0;
        return total + (available - item.quantity);
      }, 0);

      return { warehouse, fillRate, slack };
    })
    .sort((a, b) => {
      if (b.fillRate !== a.fillRate) {
        return b.fillRate - a.fillRate;
      }
      return a.slack - b.slack;
    });

  const best = ranked[0];
  return {
    warehouseId: best.warehouse.warehouseId,
    fillRate: Number(best.fillRate.toFixed(2)),
    notes,
  };
};
