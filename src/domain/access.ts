import type { AppSnapshot, CompanyId, Lot, Movement } from '@meetcompany/demo-domain';
import type { Context, Profile } from '../store/useAdminStore';
export const canSeeCosts = (profile: Profile) => profile !== 'warehouse-chief';
export function visibleLots(snapshot: AppSnapshot, profile: Profile, context: Context, company: CompanyId): Lot[] {
  const owner = profile === 'company-admin' ? company : context === 'group' || context === 'warehouse' ? null : context;
  return snapshot.lots.filter((lot) => lot.availableGrams > 0 && (!owner || lot.companyId === owner));
}
export function visibleMovements(snapshot: AppSnapshot, profile: Profile, context: Context, company: CompanyId): Movement[] {
  const owner = profile === 'company-admin' ? company : context === 'group' || context === 'warehouse' ? null : context;
  return snapshot.movements.filter((movement) => !owner || movement.companyId === owner);
}
