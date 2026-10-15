import { create } from 'zustand';
import type { CompanyId } from '@meetcompany/demo-domain';

export type UserRole = 'management' | 'company-admin' | 'warehouse-chief' | 'app-operator';

export type UserItem = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: CompanyId;
  pin?: string; // Requerido para operadores de la app móvil
  active: boolean;
  createdAt: string;
  createdBy: string;
};

const initialUsers: UserItem[] = [
  {
    id: 'usr-1',
    name: 'Celedonio Heredia',
    email: 'c.heredia@grupocarnico.com',
    role: 'management',
    companyId: 'rodrigo',
    active: true,
    createdAt: '2026-10-01',
    createdBy: 'Sistema Raíz',
  },
  {
    id: 'usr-2',
    name: 'Andrés Espinosa',
    email: 'a.espinosa@rodrigo.com',
    role: 'company-admin',
    companyId: 'rodrigo',
    active: true,
    createdAt: '2026-10-02',
    createdBy: 'Celedonio Heredia (Gerencia)',
  },
  {
    id: 'usr-3',
    name: 'Patricia Morán',
    email: 'p.moran@qualitymeats.com',
    role: 'company-admin',
    companyId: 'quality',
    active: true,
    createdAt: '2026-10-02',
    createdBy: 'Celedonio Heredia (Gerencia)',
  },
  {
    id: 'usr-4',
    name: 'Jorge Alarcón',
    email: 'j.alarcon@meetcompany.com',
    role: 'warehouse-chief',
    companyId: 'meet',
    active: true,
    createdAt: '2026-10-03',
    createdBy: 'Celedonio Heredia (Gerencia)',
  },
  {
    id: 'usr-5',
    name: 'Carlos Mendoza',
    email: 'c.mendoza@planta.meetcompany.com',
    role: 'app-operator',
    companyId: 'rodrigo',
    pin: '1234',
    active: true,
    createdAt: '2026-10-04',
    createdBy: 'Jorge Alarcón (Jefe de Almacén)',
  },
  {
    id: 'usr-6',
    name: 'Roberto Gómez',
    email: 'r.gomez@planta.meetcompany.com',
    role: 'app-operator',
    companyId: 'quality',
    pin: '5678',
    active: true,
    createdAt: '2026-10-04',
    createdBy: 'Jorge Alarcón (Jefe de Almacén)',
  },
  {
    id: 'usr-7',
    name: 'Luis Morales',
    email: 'l.morales@planta.meetcompany.com',
    role: 'app-operator',
    companyId: 'meet',
    pin: '9012',
    active: true,
    createdAt: '2026-10-05',
    createdBy: 'Jorge Alarcón (Jefe de Almacén)',
  },
];

type UserState = {
  users: UserItem[];
  addUser: (user: Omit<UserItem, 'id' | 'createdAt'>) => void;
  toggleUserStatus: (id: string) => void;
  resetUsers: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  users: initialUsers,
  addUser: (userData) => {
    set((state) => ({
      users: [
        ...state.users,
        {
          ...userData,
          id: `usr-${state.users.length + 1}`,
          createdAt: new Date().toISOString().slice(0, 10),
        },
      ],
    }));
  },
  toggleUserStatus: (id) => {
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, active: !u.active } : u)),
    }));
  },
  resetUsers: () => set({ users: initialUsers }),
}));
