import { dispatch, split } from './commands.ts';
import { scenarios } from './scenarios.ts';
import type { AppSnapshot, Movement, Lot } from './types.ts';

export type DemoStage = 'receipts' | 'production' | 'completed';
export const DEMO_DATE = '2026-10-14';
const clock = ['09:00:00','09:05:00','09:10:00','11:00:00','11:20:00','14:00:00','14:10:00','14:20:00'];

export function preloadedSnapshot(): AppSnapshot {
  const lots: Lot[] = scenarios.map((scenario) => ({
    id: `seed-${scenario.id}-${scenario.finishedProductId ? 'finished' : 'raw'}`,
    companyId: scenario.companyId,
    warehouseId: 'meet-warehouse',
    productId: scenario.rawProductId ?? scenario.finishedProductId!,
    initialGrams: scenario.receiptGrams,
    availableGrams: scenario.receiptGrams,
    status: 'available',
  }));
  const movements: Movement[] = scenarios.map((scenario, index) => ({
    id: `movement-seed-${scenario.id}`,
    operationId: `seed-receipt-${scenario.id}`,
    type: 'receipt',
    companyId: scenario.companyId,
    lotIds: [lots[index].id],
    grams: scenario.receiptGrams,
    costCents: scenario.costCents,
    createdAt: `${DEMO_DATE}T${clock[index]}.000Z`,
    syncStatus: 'synced',
  }));
  return { version: 1, lots, movements,
    appliedOperations: Object.fromEntries(movements.map((movement) => [movement.operationId, movement.lotIds])),
    pendingOperationIds: [] };
}
export const emptySnapshot = (): AppSnapshot => ({ version: 1, lots: [], movements: [], appliedOperations: {}, pendingOperationIds: [] });

export function buildDemoSnapshot(stage: DemoStage): AppSnapshot {
  let state: AppSnapshot = preloadedSnapshot();
  const setTime = (index: number) => {
    const last = state.movements.at(-1);
    if (last) last.createdAt = `${DEMO_DATE}T${clock[index]}.000Z`;
  };
  if (stage === 'receipts') return state;
  scenarios.filter((item) => item.rawProductId).forEach((item, index) => {
    const result = split(state, { operationId: `seed-split-${item.id}`, companyId: item.companyId, lotId: `seed-${item.id}-raw`, outputs: item.outputs, wasteGrams: item.wasteGrams }, item.companyId, true);
    if (!result.ok) throw new Error(result.message);
    state = result.value.snapshot;
    setTime(index + 3);
  });
  if (stage === 'production') return state;
  scenarios.forEach((item, index) => {
    const productLot = state.lots.find((lot) => lot.companyId === item.companyId && lot.productId === item.dispatchProductId);
    if (!productLot) throw new Error(`Falta lote ${item.dispatchProductId}`);
    const result = dispatch(state, { operationId: `seed-dispatch-${item.id}`, companyId: item.companyId, lotId: productLot.id, grams: item.dispatchGrams, customerLabel: item.customerLabel }, item.companyId, true);
    if (!result.ok) throw new Error(result.message);
    state = result.value.snapshot;
    setTime(index + 5);
  });
  return state;
}

export function availableGrams(state: AppSnapshot): number {
  return state.lots.reduce((sum, lot) => sum + lot.availableGrams, 0);
}
export function usefulLots(state: AppSnapshot): Lot[] {
  return state.lots.filter((lot) => lot.availableGrams > 0);
}
export function movementsByType(state: AppSnapshot, type: Movement['type']): Movement[] {
  return state.movements.filter((movement) => movement.type === type);
}
