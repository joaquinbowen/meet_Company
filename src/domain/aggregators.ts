import { allocateLotCosts, type AppSnapshot, type Lot, type Movement } from '@meetcompany/demo-domain';
import { visibleLots, visibleMovements } from './access';
import type { Context, Profile } from '../store/useAdminStore';
import type { CompanyId } from '@meetcompany/demo-domain';
export type ReportData = { lots: Lot[]; movements: Movement[]; processedGrams: number; usefulGrams: number; wasteGrams: number; dispatchedGrams: number; stockGrams: number; stockCostCents: number; costs: Map<string, number> };
export function reportData(snapshot: AppSnapshot, profile: Profile, context: Context, company: CompanyId): ReportData {
  const lots = visibleLots(snapshot, profile, context, company);
  const movements = visibleMovements(snapshot, profile, context, company);
  const splits = movements.filter((m) => m.type === 'split');
  const costMap = new Map(allocateLotCosts(snapshot).map((entry) => [entry.lotId, entry.remainingCostCents]));
  return {
    lots, movements,
    processedGrams: splits.reduce((sum, m) => sum + m.grams, 0),
    usefulGrams: splits.reduce((sum, m) => sum + m.grams - (m.wasteGrams ?? 0), 0),
    wasteGrams: splits.reduce((sum, m) => sum + (m.wasteGrams ?? 0), 0),
    dispatchedGrams: movements.filter((m) => m.type === 'dispatch').reduce((sum, m) => sum + m.grams, 0),
    stockGrams: lots.reduce((sum, lot) => sum + lot.availableGrams, 0),
    stockCostCents: lots.reduce((sum, lot) => sum + (costMap.get(lot.id) ?? 0), 0),
    costs: costMap,
  };
}
