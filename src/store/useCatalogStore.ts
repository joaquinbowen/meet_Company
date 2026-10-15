import { create } from 'zustand';
import type { CompanyId, ProductKind } from '@meetcompany/demo-domain';

export type CatalogProduct = {
  id: string;
  name: string;
  kind: ProductKind;
  category: string;
  companyId: CompanyId;
  sourceProductId?: string;
  refCostKgCents: number;
  refPriceKgCents: number;
  origin: 'base' | 'excel' | 'form';
  templateId?: string;
};

export type CutTemplateItem = {
  productId: string;
  productName: string;
  yieldPercent: number;
  refPriceKgCents: number;
};

export type CutTemplate = {
  id: string;
  name: string;
  rawProductId: string;
  rawProductName: string;
  origin: 'base' | 'excel' | 'form';
  items: CutTemplateItem[];
  wastePercent: number;
};

// Productos iniciales precargados (Base hardcodeada original)
const initialProducts: CatalogProduct[] = [
  {
    id: 'res-entera',
    name: 'Res Entera',
    kind: 'raw',
    category: 'Bovino',
    companyId: 'rodrigo',
    refCostKgCents: 300,
    refPriceKgCents: 450,
    origin: 'base',
    templateId: 'tpl-res',
  },
  {
    id: 'cerdo-canal',
    name: 'Cerdo en Canal',
    kind: 'raw',
    category: 'Porcino',
    companyId: 'quality',
    refCostKgCents: 250,
    refPriceKgCents: 380,
    origin: 'base',
    templateId: 'tpl-cerdo',
  },
  {
    id: 'lomo-importado',
    name: 'Cajas de Lomo Importado Premium',
    kind: 'finished',
    category: 'Bovino Importado',
    companyId: 'finilong',
    refCostKgCents: 1000,
    refPriceKgCents: 1500,
    origin: 'base',
  },
  {
    id: 'lomo-fino',
    name: 'Lomo Fino',
    kind: 'cut',
    category: 'Bovino',
    companyId: 'rodrigo',
    sourceProductId: 'res-entera',
    refCostKgCents: 343,
    refPriceKgCents: 950,
    origin: 'base',
  },
  {
    id: 'churrasco',
    name: 'Churrasco',
    kind: 'cut',
    category: 'Bovino',
    companyId: 'rodrigo',
    sourceProductId: 'res-entera',
    refCostKgCents: 343,
    refPriceKgCents: 680,
    origin: 'base',
  },
  {
    id: 'carne-guiso',
    name: 'Carne para Guiso',
    kind: 'cut',
    category: 'Bovino',
    companyId: 'rodrigo',
    sourceProductId: 'res-entera',
    refCostKgCents: 343,
    refPriceKgCents: 520,
    origin: 'base',
  },
  {
    id: 'chuletas-cerdo',
    name: 'Chuletas de Cerdo',
    kind: 'cut',
    category: 'Porcino',
    companyId: 'quality',
    sourceProductId: 'cerdo-canal',
    refCostKgCents: 278,
    refPriceKgCents: 480,
    origin: 'base',
  },
  {
    id: 'costillas',
    name: 'Costillas',
    kind: 'cut',
    category: 'Porcino',
    companyId: 'quality',
    sourceProductId: 'cerdo-canal',
    refCostKgCents: 278,
    refPriceKgCents: 550,
    origin: 'base',
  },
  {
    id: 'pierna',
    name: 'Pierna',
    kind: 'cut',
    category: 'Porcino',
    companyId: 'quality',
    sourceProductId: 'cerdo-canal',
    refCostKgCents: 278,
    refPriceKgCents: 420,
    origin: 'base',
  },
];

const initialTemplates: CutTemplate[] = [
  {
    id: 'tpl-res',
    name: 'Plantilla Desposte Estándar Res (Rodrigo)',
    rawProductId: 'res-entera',
    rawProductName: 'Res Entera',
    origin: 'base',
    items: [
      { productId: 'lomo-fino', productName: 'Lomo Fino', yieldPercent: 25, refPriceKgCents: 950 },
      { productId: 'churrasco', productName: 'Churrasco', yieldPercent: 37.5, refPriceKgCents: 680 },
      { productId: 'carne-guiso', productName: 'Carne para Guiso', yieldPercent: 25, refPriceKgCents: 520 },
    ],
    wastePercent: 12.5,
  },
  {
    id: 'tpl-cerdo',
    name: 'Plantilla Desposte Estándar Cerdo (Quality)',
    rawProductId: 'cerdo-canal',
    rawProductName: 'Cerdo en Canal',
    origin: 'base',
    items: [
      { productId: 'chuletas-cerdo', productName: 'Chuletas de Cerdo', yieldPercent: 40, refPriceKgCents: 480 },
      { productId: 'costillas', productName: 'Costillas', yieldPercent: 35, refPriceKgCents: 550 },
      { productId: 'pierna', productName: 'Pierna', yieldPercent: 15, refPriceKgCents: 420 },
    ],
    wastePercent: 10,
  },
];

// Los 2 productos que vienen en el archivo Excel a simular
export const excelSimulatedPackage = {
  filename: 'catalogo_maestro_plantas_oct2026.xlsx',
  sheetName: 'Catalogo_Plantas_y_Cortes',
  products: [
    {
      id: 'cordero-canal',
      name: 'Cordero en Canal',
      kind: 'raw' as const,
      category: 'Ovino',
      companyId: 'rodrigo' as const,
      refCostKgCents: 450,
      refPriceKgCents: 650,
      origin: 'excel' as const,
      templateId: 'tpl-cordero',
    },
    {
      id: 'pierna-cordero',
      name: 'Pierna de Cordero',
      kind: 'cut' as const,
      category: 'Ovino',
      companyId: 'rodrigo' as const,
      sourceProductId: 'cordero-canal',
      refCostKgCents: 500,
      refPriceKgCents: 1150,
      origin: 'excel' as const,
    },
    {
      id: 'chuletillas-cordero',
      name: 'Chuletillas de Cordero',
      kind: 'cut' as const,
      category: 'Ovino',
      companyId: 'rodrigo' as const,
      sourceProductId: 'cordero-canal',
      refCostKgCents: 500,
      refPriceKgCents: 980,
      origin: 'excel' as const,
    },
    {
      id: 'paletilla-cordero',
      name: 'Paletilla de Cordero',
      kind: 'cut' as const,
      category: 'Ovino',
      companyId: 'rodrigo' as const,
      sourceProductId: 'cordero-canal',
      refCostKgCents: 500,
      refPriceKgCents: 750,
      origin: 'excel' as const,
    },
    {
      id: 'pollo-entero',
      name: 'Pollo Beneficiado Entero',
      kind: 'raw' as const,
      category: 'Aviar',
      companyId: 'quality' as const,
      refCostKgCents: 210,
      refPriceKgCents: 290,
      origin: 'excel' as const,
      templateId: 'tpl-pollo',
    },
    {
      id: 'pechuga-pollo',
      name: 'Pechuga Fileteada Especial',
      kind: 'cut' as const,
      category: 'Aviar',
      companyId: 'quality' as const,
      sourceProductId: 'pollo-entero',
      refCostKgCents: 240,
      refPriceKgCents: 580,
      origin: 'excel' as const,
    },
    {
      id: 'muslos-pollo',
      name: 'Cuartos Traseros (Pierna / Muslo)',
      kind: 'cut' as const,
      category: 'Aviar',
      companyId: 'quality' as const,
      sourceProductId: 'pollo-entero',
      refCostKgCents: 240,
      refPriceKgCents: 440,
      origin: 'excel' as const,
    },
    {
      id: 'alitas-pollo',
      name: 'Alitas de Pollo Seleccionadas',
      kind: 'cut' as const,
      category: 'Aviar',
      companyId: 'quality' as const,
      sourceProductId: 'pollo-entero',
      refCostKgCents: 240,
      refPriceKgCents: 490,
      origin: 'excel' as const,
    },
    {
      id: 'carcasa-menudencias',
      name: 'Carcasa y Menudencias de Pollo',
      kind: 'cut' as const,
      category: 'Aviar',
      companyId: 'quality' as const,
      sourceProductId: 'pollo-entero',
      refCostKgCents: 150,
      refPriceKgCents: 180,
      origin: 'excel' as const,
    },
  ],
  templates: [
    {
      id: 'tpl-cordero',
      name: 'Plantilla Desposte Cordero Ovino Prémium',
      rawProductId: 'cordero-canal',
      rawProductName: 'Cordero en Canal',
      origin: 'excel' as const,
      items: [
        { productId: 'pierna-cordero', productName: 'Pierna de Cordero', yieldPercent: 35, refPriceKgCents: 1150 },
        { productId: 'chuletillas-cordero', productName: 'Chuletillas de Cordero', yieldPercent: 30, refPriceKgCents: 980 },
        { productId: 'paletilla-cordero', productName: 'Paletilla de Cordero', yieldPercent: 20, refPriceKgCents: 750 },
      ],
      wastePercent: 15,
    },
    {
      id: 'tpl-pollo',
      name: 'Plantilla Despiece Integral de Pollo',
      rawProductId: 'pollo-entero',
      rawProductName: 'Pollo Beneficiado Entero',
      origin: 'excel' as const,
      items: [
        { productId: 'pechuga-pollo', productName: 'Pechuga Fileteada Especial', yieldPercent: 32, refPriceKgCents: 580 },
        { productId: 'muslos-pollo', productName: 'Cuartos Traseros (Pierna / Muslo)', yieldPercent: 30, refPriceKgCents: 440 },
        { productId: 'alitas-pollo', productName: 'Alitas de Pollo Seleccionadas', yieldPercent: 14, refPriceKgCents: 490 },
        { productId: 'carcasa-menudencias', productName: 'Carcasa y Menudencias de Pollo', yieldPercent: 18, refPriceKgCents: 180 },
      ],
      wastePercent: 6,
    },
  ],
};

type CatalogState = {
  products: CatalogProduct[];
  templates: CutTemplate[];
  excelImported: boolean;
  formSubmitted: boolean;
  importExcel: () => void;
  addProductAndTemplate: (
    rawProduct: Omit<CatalogProduct, 'origin'>,
    derivedCuts: Array<{ id: string; name: string; yieldPercent: number; refPriceKgCents: number }>,
    wastePercent: number,
    templateName: string
  ) => void;
  resetCatalog: () => void;
};

export const useCatalogStore = create<CatalogState>((set) => ({
  products: initialProducts,
  templates: initialTemplates,
  excelImported: false,
  formSubmitted: false,

  importExcel: () => {
    set((state) => {
      // Filtrar para evitar duplicados si ya existen
      const existingProductIds = new Set(state.products.map((p) => p.id));
      const newProducts = excelSimulatedPackage.products.filter((p) => !existingProductIds.has(p.id));

      const existingTemplateIds = new Set(state.templates.map((t) => t.id));
      const newTemplates = excelSimulatedPackage.templates.filter((t) => !existingTemplateIds.has(t.id));

      return {
        products: [...state.products, ...newProducts],
        templates: [...state.templates, ...newTemplates],
        excelImported: true,
      };
    });
  },

  addProductAndTemplate: (rawProduct, derivedCuts, wastePercent, templateName) => {
    set((state) => {
      const templateId = `tpl-${rawProduct.id}`;
      const fullRawProduct: CatalogProduct = {
        ...rawProduct,
        origin: 'form',
        templateId,
      };

      const cutProducts: CatalogProduct[] = derivedCuts.map((cut) => ({
        id: cut.id,
        name: cut.name,
        kind: 'cut',
        category: rawProduct.category,
        companyId: rawProduct.companyId,
        sourceProductId: rawProduct.id,
        refCostKgCents: rawProduct.refCostKgCents,
        refPriceKgCents: cut.refPriceKgCents,
        origin: 'form',
      }));

      const newTemplate: CutTemplate = {
        id: templateId,
        name: templateName,
        rawProductId: rawProduct.id,
        rawProductName: rawProduct.name,
        origin: 'form',
        items: derivedCuts.map((c) => ({
          productId: c.id,
          productName: c.name,
          yieldPercent: c.yieldPercent,
          refPriceKgCents: c.refPriceKgCents,
        })),
        wastePercent,
      };

      return {
        products: [...state.products, fullRawProduct, ...cutProducts],
        templates: [...state.templates, newTemplate],
        formSubmitted: true,
      };
    });
  },

  resetCatalog: () => {
    set({
      products: initialProducts,
      templates: initialTemplates,
      excelImported: false,
      formSubmitted: false,
    });
  },
}));
