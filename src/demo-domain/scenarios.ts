import type { CompanyId, ScenarioId } from './types.ts';

export type Scenario = {
  id: ScenarioId;
  companyId: CompanyId;
  rawProductId?: string;
  finishedProductId?: string;
  receiptGrams: number;
  costCents: number;
  outputs: { productId: string; grams: number }[];
  wasteGrams: number;
  dispatchProductId: string;
  dispatchGrams: number;
  customerLabel: string;
};

export const scenarios: Scenario[] = [
  {
    id: 'rodrigo', companyId: 'rodrigo', rawProductId: 'res-entera', receiptGrams: 400_000, costCents: 120_000,
    outputs: [
      { productId: 'lomo-fino', grams: 100_000 },
      { productId: 'churrasco', grams: 150_000 },
      { productId: 'carne-guiso', grams: 100_000 },
    ], wasteGrams: 50_000, dispatchProductId: 'lomo-fino', dispatchGrams: 30_000, customerLabel: 'Venta mostrador',
  },
  {
    id: 'quality', companyId: 'quality', rawProductId: 'cerdo-canal', receiptGrams: 200_000, costCents: 50_000,
    outputs: [
      { productId: 'chuletas-cerdo', grams: 80_000 },
      { productId: 'costillas', grams: 70_000 },
      { productId: 'pierna', grams: 30_000 },
    ], wasteGrams: 20_000, dispatchProductId: 'costillas', dispatchGrams: 40_000, customerLabel: 'Venta mostrador',
  },
  {
    id: 'finilong', companyId: 'finilong', finishedProductId: 'lomo-importado', receiptGrams: 150_000,
    costCents: 150_000, outputs: [], wasteGrams: 0, dispatchProductId: 'lomo-importado', dispatchGrams: 50_000,
    customerLabel: 'Cliente VIP',
  },
];

export const scenarioById = (id: ScenarioId): Scenario => {
  const scenario = scenarios.find((item) => item.id === id);
  if (!scenario) throw new Error('Caso de demostración desconocido.');
  return scenario;
};

