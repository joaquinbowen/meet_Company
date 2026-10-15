export type CompanyId = 'meet' | 'rodrigo' | 'quality' | 'finilong';
export type ProductKind = 'raw' | 'cut' | 'finished';
export type LotStatus = 'available' | 'consumed';
export type MovementType = 'receipt' | 'split' | 'dispatch';
export type SyncStatus = 'pending' | 'synced';

export type Company = { id: CompanyId; name: string };
export type Product = {
  id: string;
  name: string;
  kind: ProductKind;
  sourceProductId?: string;
};
export type Lot = {
  id: string;
  companyId: CompanyId;
  warehouseId: 'meet-warehouse';
  productId: string;
  initialGrams: number;
  availableGrams: number;
  status: LotStatus;
  parentLotId?: string;
};
export type Movement = {
  id: string;
  operationId: string;
  type: MovementType;
  companyId: CompanyId;
  lotIds: string[];
  grams: number;
  wasteGrams?: number;
  costCents?: number;
  supplierLabel?: string;
  customerLabel?: string;
  createdAt: string;
  syncStatus: SyncStatus;
};
export type ScenarioId = 'rodrigo' | 'quality' | 'finilong';
export type AppSnapshot = {
  version: 1;
  lots: Lot[];
  movements: Movement[];
  appliedOperations: Record<string, string[]>;
  pendingOperationIds: string[];
};
export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; code: string; message: string };
export type ReceiptInput = {
  operationId: string;
  companyId: CompanyId;
  productId: string;
  grams: number;
  costCents: number;
  supplierLabel?: string;
};
export type SplitInput = {
  operationId: string;
  companyId: CompanyId;
  lotId: string;
  outputs: { productId: string; grams: number }[];
  wasteGrams: number;
};
export type DispatchInput = {
  operationId: string;
  companyId: CompanyId;
  lotId: string;
  grams: number;
  customerLabel?: string;
};
