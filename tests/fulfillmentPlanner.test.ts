import { describe, expect, it } from 'vitest';
import type { LineItem, WarehouseAvailability } from '../src/index.js';
import { recommendWarehouse } from '../src/index.js';

const items: LineItem[] = [
  { sku: 'frozen-1', quantity: 5, unitPrice: 30, category: 'seasonal' },
  { sku: 'dry-1', quantity: 2, unitPrice: 15, category: 'everyday' },
];

const warehouses: WarehouseAvailability[] = [
  {
    warehouseId: 'north-temp',
    coverageRegion: 'north',
    temperatureControlled: true,
    inventory: {
      'frozen-1': 10,
      'dry-1': 5,
    },
  },
  {
    warehouseId: 'north-standard',
    coverageRegion: 'north',
    temperatureControlled: false,
    inventory: {
      'frozen-1': 15,
      'dry-1': 20,
    },
  },
];

describe('recommendWarehouse', () => {
  it('prefers temperature-controlled region match when order requires cold chain', () => {
    const result = recommendWarehouse('order-3', 'north', items, warehouses);
    expect(result.warehouseId).toBe('north-temp');
    expect(result.fillRate).toBe(1);
  });

  it('falls back to best effort when stock is insufficient', () => {
    const diminishedInventory: WarehouseAvailability[] = warehouses.map((warehouse) => ({
      ...warehouse,
      inventory: { ...warehouse.inventory, 'frozen-1': 2 },
    }));

    const result = recommendWarehouse('order-4', 'north', items, diminishedInventory);
    expect(result.fillRate).toBeLessThan(1);
    expect(result.notes).toContain('No warehouse can fully fulfill order, returning best effort option.');
  });
});
