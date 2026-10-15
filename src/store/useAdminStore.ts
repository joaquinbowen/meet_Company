import { create } from 'zustand';
import { buildDemoSnapshot, type DemoStage, type CompanyId } from '@meetcompany/demo-domain';

export type Profile = 'management' | 'company-admin' | 'warehouse-chief';
export type Context = 'group' | 'warehouse' | CompanyId;
type AdminState = { profile: Profile; context: Context; company: CompanyId; stage: DemoStage; syncedAt: string | null; syncing: boolean; snapshot: ReturnType<typeof buildDemoSnapshot>; setProfile: (profile: Profile) => void; setContext: (context: Context) => void; setCompany: (company: CompanyId) => void; setStage: (stage: DemoStage) => void; simulateSync: () => Promise<void> };
export const useAdminStore = create<AdminState>((set, get) => ({
  profile: 'management', context: 'group', company: 'rodrigo', stage: 'completed', syncedAt: null, syncing: false, snapshot: buildDemoSnapshot('completed'),
  setProfile: (profile) => set({ profile, context: profile === 'management' ? 'group' : profile === 'warehouse-chief' ? 'warehouse' : get().company }),
  setContext: (context) => set({ context }),
  setCompany: (company) => set({ company, context: company }),
  setStage: (stage) => set({ stage }),
  simulateSync: async () => {
    if (get().syncing) return;
    set({ syncing: true });
    await new Promise((resolve) => setTimeout(resolve, 550));
    set({ snapshot: buildDemoSnapshot(get().stage), syncedAt: new Date().toISOString(), syncing: false });
  },
}));
