import type { AppSnapshot, DispatchInput, Lot, Movement, ReceiptInput, Result, SplitInput } from './types.ts';
import { sumGrams } from './weights.ts';
import { outputsForRawProduct, productById } from './catalog.ts';

type CommandValue<T> = { snapshot: AppSnapshot; value: T };
const failure = <T>(code: string, message: string): Result<T> => ({ ok: false, code, message });
export const createEmptySnapshot = (): AppSnapshot => ({
  version: 1, lots: [], movements: [], appliedOperations: {}, pendingOperationIds: [],
});

function invalidOperation<T>(snapshot: AppSnapshot, operationId: string, expectedType: Movement['type']): Result<CommandValue<T>> | undefined {
  const previous = snapshot.movements.find((movement) => movement.operationId === operationId);
  if (!previous) return undefined;
  if (previous.type !== expectedType) return failure('DUPLICATE_OPERATION', 'Este ID de operación ya se usó.');
  const value = snapshot.appliedOperations[operationId] as T | undefined;
  return value === undefined
    ? failure('DUPLICATE_OPERATION', 'No se pudo recuperar el resultado de la operación.')
    : { ok: true, value: { snapshot, value } };
}

function validGrams(value: number, allowZero = false): boolean {
  return Number.isSafeInteger(value) && (allowZero ? value >= 0 : value > 0);
}

function appendMovement(snapshot: AppSnapshot, movement: Movement, value: string[], isOnline: boolean): AppSnapshot {
  const savedMovement = { ...movement, syncStatus: isOnline ? 'synced' as const : 'pending' as const };
  return {
    ...snapshot,
    movements: [...snapshot.movements, savedMovement],
    appliedOperations: { ...snapshot.appliedOperations, [movement.operationId]: value },
    pendingOperationIds: isOnline ? snapshot.pendingOperationIds : [...snapshot.pendingOperationIds, movement.operationId],
  };
}

export function receive(snapshot: AppSnapshot, input: ReceiptInput, activeCompanyId: ReceiptInput['companyId'], isOnline: boolean): Result<CommandValue<string>> {
  const repeated = invalidOperation<string>(snapshot, input.operationId, 'receipt');
  if (repeated) return repeated;
  if (input.companyId !== activeCompanyId) return failure('COMPANY_MISMATCH', 'La empresa activa no coincide con la recepción.');
  if (!validGrams(input.grams) || !validGrams(input.costCents, true)) return failure('INVALID_AMOUNT', 'Revisa el peso y el costo.');
  const product = productById(input.productId);
  if (!product || product.kind === 'cut') return failure('INVALID_PRODUCT', 'Selecciona una materia prima o producto terminado.');
  const lotId = `lot-${input.operationId}`;
  if (snapshot.lots.some((lot) => lot.id === lotId)) return failure('DUPLICATE_ID', 'El identificador del lote ya existe.');
  const lot: Lot = {
    id: lotId, companyId: input.companyId, warehouseId: 'meet-warehouse', productId: input.productId,
    initialGrams: input.grams, availableGrams: input.grams, status: 'available',
  };
  const movement: Movement = {
    id: `movement-${input.operationId}`, operationId: input.operationId, type: 'receipt', companyId: input.companyId,
    lotIds: [lotId], grams: input.grams, costCents: input.costCents, supplierLabel: input.supplierLabel?.trim() || undefined, createdAt: new Date().toISOString(), syncStatus: 'synced',
  };
  const withLot = { ...snapshot, lots: [...snapshot.lots, lot] };
  return { ok: true, value: { snapshot: appendMovement(withLot, movement, [lotId], isOnline), value: lotId } };
}

export function split(snapshot: AppSnapshot, input: SplitInput, activeCompanyId: SplitInput['companyId'], isOnline: boolean): Result<CommandValue<string[]>> {
  const repeated = invalidOperation<string[]>(snapshot, input.operationId, 'split');
  if (repeated) return repeated;
  if (input.companyId !== activeCompanyId) return failure('COMPANY_MISMATCH', 'La empresa activa no coincide con el lote.');
  const parent = snapshot.lots.find((lot) => lot.id === input.lotId);
  if (!parent || parent.companyId !== activeCompanyId) return failure('LOT_NOT_FOUND', 'Lote no disponible para esta empresa.');
  if (parent.status !== 'available' || parent.availableGrams <= 0) return failure('LOT_CONSUMED', 'Este lote ya fue procesado.');
  const productIds = input.outputs.map((output) => output.productId);
  if (!input.outputs.length || new Set(productIds).size !== productIds.length) return failure('INVALID_OUTPUTS', 'Agrega cortes distintos antes de cerrar.');
  if (input.outputs.some((output) => !validGrams(output.grams))) return failure('INVALID_AMOUNT', 'Cada corte debe tener un peso mayor que cero.');
  if (!validGrams(input.wasteGrams, true)) return failure('INVALID_AMOUNT', 'La merma no puede ser negativa.');
  const allowed = outputsForRawProduct[parent.productId] ?? [];
  if (input.outputs.some((output) => !allowed.includes(output.productId))) return failure('INVALID_PRODUCT', 'Uno o más cortes no corresponden a esta materia prima.');
  let total: number;
  try { total = sumGrams([...input.outputs.map((output) => output.grams), input.wasteGrams]); }
  catch { return failure('INVALID_AMOUNT', 'Peso distribuido fuera de rango.'); }
  if (total !== parent.availableGrams) return failure('UNBALANCED_SPLIT', 'La suma de cortes y merma debe coincidir con el peso del lote.');
  const childLots: Lot[] = input.outputs.map((output) => ({
    id: `lot-${input.operationId}-${output.productId}`, companyId: activeCompanyId, warehouseId: 'meet-warehouse',
    productId: output.productId, initialGrams: output.grams, availableGrams: output.grams,
    status: 'available', parentLotId: parent.id,
  }));
  if (childLots.some((child) => snapshot.lots.some((existing) => existing.id === child.id))) return failure('DUPLICATE_ID', 'Uno de los lotes de salida ya existe.');
  const lots = snapshot.lots.map((lot) => lot.id === parent.id ? { ...lot, status: 'consumed' as const, availableGrams: 0 } : lot).concat(childLots);
  const movement: Movement = {
    id: `movement-${input.operationId}`, operationId: input.operationId, type: 'split', companyId: activeCompanyId,
    lotIds: [parent.id, ...childLots.map((lot) => lot.id)], grams: total, wasteGrams: input.wasteGrams,
    createdAt: new Date().toISOString(), syncStatus: 'synced',
  };
  const withLots = { ...snapshot, lots };
  const ids = childLots.map((lot) => lot.id);
  return { ok: true, value: { snapshot: appendMovement(withLots, movement, ids, isOnline), value: ids } };
}

export function dispatch(snapshot: AppSnapshot, input: DispatchInput, activeCompanyId: DispatchInput['companyId'], isOnline: boolean): Result<CommandValue<string>> {
  const repeated = invalidOperation<string>(snapshot, input.operationId, 'dispatch');
  if (repeated) return repeated;
  if (input.companyId !== activeCompanyId) return failure('COMPANY_MISMATCH', 'La empresa activa no coincide con el despacho.');
  const lot = snapshot.lots.find((item) => item.id === input.lotId);
  if (!lot || lot.companyId !== activeCompanyId) return failure('LOT_NOT_FOUND', 'Lote no disponible para esta empresa.');
  if (lot.status !== 'available' || lot.availableGrams <= 0) return failure('LOT_CONSUMED', 'Este lote ya no tiene existencias.');
  if (!validGrams(input.grams)) return failure('INVALID_AMOUNT', 'El despacho debe ser mayor que cero.');
  if (input.grams > lot.availableGrams) return failure('INSUFFICIENT_STOCK', 'El despacho supera el peso disponible.');
  const movementId = `movement-${input.operationId}`;
  const lots = snapshot.lots.map((item) => item.id === lot.id
    ? { ...item, availableGrams: item.availableGrams - input.grams, status: item.availableGrams === input.grams ? 'consumed' as const : 'available' as const }
    : item);
  const movement: Movement = {
    id: movementId, operationId: input.operationId, type: 'dispatch', companyId: activeCompanyId,
    lotIds: [lot.id], grams: input.grams, customerLabel: input.customerLabel?.trim() || undefined,
    createdAt: new Date().toISOString(), syncStatus: 'synced',
  };
  const withLots = { ...snapshot, lots };
  return { ok: true, value: { snapshot: appendMovement(withLots, movement, [movementId], isOnline), value: movementId } };
}

