import type { AppSnapshot, Lot } from './types.ts';

export type LotCost = { lotId: string; initialCostCents: number; remainingCostCents: number };
function allocate(total: number, children: Lot[]): Map<string, number> {
  const grams = children.reduce((sum, child) => sum + child.initialGrams, 0);
  const entries = children.map((child) => {
    const exact = total * child.initialGrams / grams;
    return { id: child.id, base: Math.floor(exact), fraction: exact - Math.floor(exact) };
  });
  let remainder = total - entries.reduce((sum, item) => sum + item.base, 0);
  entries.sort((a, b) => b.fraction - a.fraction || a.id.localeCompare(b.id));
  for (const entry of entries) if (remainder-- > 0) entry.base++;
  return new Map(entries.map((entry) => [entry.id, entry.base]));
}
export function allocateLotCosts(state: AppSnapshot): LotCost[] {
  const receiptCosts = new Map<string, number>();
  for (const movement of state.movements.filter((item) => item.type === 'receipt')) {
    receiptCosts.set(movement.lotIds[0], movement.costCents ?? 0);
  }
  const originalCosts = new Map(receiptCosts);
  for (const parent of state.lots.filter((lot) => state.lots.some((child) => child.parentLotId === lot.id))) {
    const children = state.lots.filter((child) => child.parentLotId === parent.id);
    const allocations = allocate(originalCosts.get(parent.id) ?? 0, children);
    originalCosts.set(parent.id, 0);
    for (const [id, cost] of allocations) originalCosts.set(id, cost);
  }
  return state.lots.map((lot) => ({ lotId: lot.id, initialCostCents: originalCosts.get(lot.id) ?? 0,
    remainingCostCents: Math.round((originalCosts.get(lot.id) ?? 0) * lot.availableGrams / lot.initialGrams) }));
}
export function dispatchCostCents(state: AppSnapshot, lotId: string): number {
  const lot = state.lots.find((item) => item.id === lotId);
  if (!lot) return 0;
  const cost = allocateLotCosts(state).find((item) => item.lotId === lotId);
  return (cost?.initialCostCents ?? 0) - (cost?.remainingCostCents ?? 0);
}
