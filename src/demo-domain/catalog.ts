import type { Company, CompanyId, Product } from './types.ts';

export const companies: Company[] = [
  { id: 'meet', name: 'Meet Company' },
  { id: 'rodrigo', name: 'Rodrigo' },
  { id: 'quality', name: 'Quality' },
  { id: 'finilong', name: 'Finilong' },
];

export const products: Product[] = [
  { id: 'res-entera', name: 'Res Entera', kind: 'raw' },
  { id: 'cerdo-canal', name: 'Cerdo en Canal', kind: 'raw' },
  { id: 'lomo-fino', name: 'Lomo Fino', kind: 'cut', sourceProductId: 'res-entera' },
  { id: 'churrasco', name: 'Churrasco', kind: 'cut', sourceProductId: 'res-entera' },
  { id: 'carne-guiso', name: 'Carne para Guiso', kind: 'cut', sourceProductId: 'res-entera' },
  { id: 'chuletas-cerdo', name: 'Chuletas de Cerdo', kind: 'cut', sourceProductId: 'cerdo-canal' },
  { id: 'costillas', name: 'Costillas', kind: 'cut', sourceProductId: 'cerdo-canal' },
  { id: 'pierna', name: 'Pierna', kind: 'cut', sourceProductId: 'cerdo-canal' },
  { id: 'lomo-importado', name: 'Cajas de Lomo Importado Premium', kind: 'finished' },
];

export const companyName = (id: CompanyId): string => companies.find((company) => company.id === id)?.name ?? id;
export const productById = (id: string): Product | undefined => products.find((product) => product.id === id);

export const outputsForRawProduct: Record<string, string[]> = {
  'res-entera': ['lomo-fino', 'churrasco', 'carne-guiso'],
  'cerdo-canal': ['chuletas-cerdo', 'costillas', 'pierna'],
};

