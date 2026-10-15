import { useMemo, useState } from 'react';
import {
  BookOpen,
  FileSpreadsheet,
  PlusCircle,
  CheckCircle2,
  Layers,
  Filter,
  Search,
  Sparkles,
  RotateCcw,
  X,
  FileCheck,
  Check,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Info,
  AlertCircle,
  Scale,
} from 'lucide-react';
import { companies, type CompanyId } from '@meetcompany/demo-domain';
import { useCatalogStore, excelSimulatedPackage, type CatalogProduct, type CutTemplate } from '../store/useCatalogStore';
import { usd } from '../utils/formatters';

export function CatalogoPlantillas() {
  const {
    products,
    templates,
    excelImported,
    formSubmitted,
    importExcel,
    addProductAndTemplate,
    resetCatalog,
  } = useCatalogStore();

  const [activeTab, setActiveTab] = useState<'products' | 'templates'>('products');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [originFilter, setOriginFilter] = useState('all');

  // Ordenamiento de tabla
  const [order, setOrder] = useState<string | null>('name');
  const [desc, setDesc] = useState(false);

  // Modales
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CutTemplate | null>(null);

  // Estado del Formulario Manual (3er producto)
  const [formName, setFormName] = useState('Pavo Entero Calidad Extra');
  const [formId, setFormId] = useState('pavo-entero');
  const [formCategory, setFormCategory] = useState('Aviar Especial');
  const [formCompany, setFormCompany] = useState<CompanyId>('meet');
  const [formCost, setFormCost] = useState('3.20');
  const [formPrice, setFormPrice] = useState('5.80');
  const [formTemplateName, setFormTemplateName] = useState('Despiece y Desposte Integral de Pavo');

  const [formCuts, setFormCuts] = useState([
    { id: 'pechuga-pavo', name: 'Pechuga de Pavo Deshuesada', yieldPercent: 35, price: '7.50' },
    { id: 'muslos-pavo', name: 'Muslos y Perniles de Pavo', yieldPercent: 30, price: '5.80' },
    { id: 'alas-pavo', name: 'Alas Enteras de Pavo', yieldPercent: 15, price: '4.20' },
  ]);
  const [formWastePercent, setFormWastePercent] = useState(20);

  // Cálculos del formulario
  const totalYield = formCuts.reduce((acc, c) => acc + (Number(c.yieldPercent) || 0), 0) + (Number(formWastePercent) || 0);
  const isYieldBalanced = Math.abs(totalYield - 100) < 0.1;

  // Manejador de ordenamiento
  const handleSort = (key: string) => {
    if (order === key) {
      setDesc(!desc);
    } else {
      setOrder(key);
      setDesc(false);
    }
  };

  const getSortIcon = (key: string) => {
    if (order !== key) return <ArrowUpDown size={13} style={{ opacity: 0.5 }} />;
    return desc ? <ArrowDown size={14} color="#A9431E" /> : <ArrowUp size={14} color="#A9431E" />;
  };

  // Filtrado de productos
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesOrigin = originFilter === 'all' || p.origin === originFilter;
    return matchesSearch && matchesCategory && matchesOrigin;
  });

  // Lista ordenada
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (order) {
      list.sort((a, b) => {
        const valA: unknown = a[order as keyof CatalogProduct] ?? '';
        const valB: unknown = b[order as keyof CatalogProduct] ?? '';
        if (typeof valA === 'number' && typeof valB === 'number') {
          return desc ? valB - valA : valA - valB;
        }
        return desc
          ? String(valB).localeCompare(String(valA), 'es')
          : String(valA).localeCompare(String(valB), 'es');
      });
    }
    return list;
  }, [filteredProducts, order, desc]);

  const categories = Array.from(new Set(products.map((p) => p.category)));

  // Manejar importación de Excel
  const handleConfirmExcel = () => {
    importExcel();
    setShowExcelModal(false);
  };

  // Manejar guardado de formulario manual
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formId.trim()) return;

    const rawCostCents = Math.round(parseFloat(formCost || '0') * 100);
    const rawPriceCents = Math.round(parseFloat(formPrice || '0') * 100);

    const derivedCuts = formCuts.map((cut) => ({
      id: cut.id.trim(),
      name: cut.name.trim(),
      yieldPercent: Number(cut.yieldPercent) || 0,
      refPriceKgCents: Math.round(parseFloat(cut.price || '0') * 100),
    }));

    addProductAndTemplate(
      {
        id: formId.trim(),
        name: formName.trim(),
        kind: 'raw',
        category: formCategory.trim(),
        companyId: formCompany,
        refCostKgCents: rawCostCents,
        refPriceKgCents: rawPriceCents,
      },
      derivedCuts,
      Number(formWastePercent) || 0,
      formTemplateName.trim()
    );

    setShowFormModal(false);
  };

  // Autocompletar datos del 3er producto
  const fillSampleThirdProduct = () => {
    setFormName('Pavo Entero Calidad Extra');
    setFormId('pavo-entero');
    setFormCategory('Aviar Especial');
    setFormCompany('meet');
    setFormCost('3.20');
    setFormPrice('5.80');
    setFormTemplateName('Despiece y Desposte Integral de Pavo');
    setFormCuts([
      { id: 'pechuga-pavo', name: 'Pechuga de Pavo Deshuesada', yieldPercent: 35, price: '7.50' },
      { id: 'muslos-pavo', name: 'Muslos y Perniles de Pavo', yieldPercent: 30, price: '5.80' },
      { id: 'alas-pavo', name: 'Alas Enteras de Pavo', yieldPercent: 15, price: '4.20' },
    ]);
    setFormWastePercent(20);
  };

  return (
    <div className="catalogo-module">
      {/* Intro del módulo */}
      <div className="report-intro">
        <div>
          <h2>Maestro de catálogo y rendimiento</h2>
          <p>Materias primas, cortes derivados y plantillas de rendimiento porcentual de desposte.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="inline-stat-card">
            <small>Total en catálogo</small>
            <strong>{filteredProducts.length} productos</strong>
          </div>
          {(excelImported || formSubmitted) && (
            <button
              onClick={resetCatalog}
              className="subtle-button"
              style={{ color: '#746F6A', border: '1px solid #D6CEC5' }}
              title="Restablecer al catálogo base inicial"
            >
              <RotateCcw size={14} />
              <span>Restablecer demo</span>
            </button>
          )}
        </div>
      </div>

      {/* Checklist interactivo del flujo de simulación */}
      <section
        style={{
          background: '#fff',
          border: '1px solid #E5DFD7',
          borderRadius: '12px',
          padding: '18px 22px',
          marginBottom: '22px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#A9431E', letterSpacing: '0.08em' }}>
              FLUJO DE INCORPORACIÓN DE PRODUCTOS AL MAESTRO
            </span>
            <h3 style={{ margin: '3px 0 0', fontSize: '16px', color: '#242A2D' }}>
              Simulación de carga masiva por Excel y registro unitario por formulario
            </h3>
          </div>
          <div
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: excelImported && formSubmitted ? '#E7F2E6' : '#FAF3ED',
              color: excelImported && formSubmitted ? '#2F6B45' : '#9A3F1D',
            }}
          >
            {excelImported && formSubmitted ? (
              <>
                <CheckCircle2 size={16} /> Flujo 100% simulado (3 nuevos productos)
              </>
            ) : (
              <>
                <Sparkles size={16} /> Demostración en curso ({excelImported ? '2' : '0'}/3 productos)
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {/* Paso 1: Base actual */}
          <div
            style={{
              padding: '14px',
              borderRadius: '9px',
              border: '1px solid #EDE7DF',
              background: '#FAF8F5',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: '#2F6B45',
                  color: '#fff',
                  fontSize: '11px',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 700,
                }}
              >
                <Check size={12} />
              </span>
              <strong style={{ fontSize: '13px' }}>1. Catálogo Base Inicial</strong>
            </div>
            <p style={{ fontSize: '12px', color: '#746F6A', margin: '0 0 8px 30px' }}>
              3 productos base: Res Entera, Cerdo en Canal y Lomo Importado con sus cortes.
            </p>
            <span
              style={{
                marginLeft: '30px',
                fontSize: '11px',
                color: '#2F6B45',
                fontWeight: 600,
                background: '#E7F2E6',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              Cargado por defecto
            </span>
          </div>

          {/* Paso 2: Subida de Excel (2 productos) */}
          <div
            style={{
              padding: '14px',
              borderRadius: '9px',
              border: `1px solid ${excelImported ? '#CFE3D0' : '#E1A382'}`,
              background: excelImported ? '#F4F9F4' : '#FFF9F5',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: excelImported ? '#2F6B45' : '#A9431E',
                  color: '#fff',
                  fontSize: '11px',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 700,
                }}
              >
                {excelImported ? <Check size={12} /> : '2'}
              </span>
              <strong style={{ fontSize: '13px' }}>2. Carga Masiva vía Excel (2 productos)</strong>
            </div>
            <p style={{ fontSize: '12px', color: '#746F6A', margin: '0 0 10px 30px' }}>
              Simula la subida de un archivo .xlsx con <em>Cordero en Canal</em> y <em>Pollo Beneficiado</em> + plantillas de cortes.
            </p>
            <div style={{ marginLeft: '30px' }}>
              {excelImported ? (
                <span
                  style={{
                    fontSize: '11px',
                    color: '#2F6B45',
                    fontWeight: 600,
                    background: '#E7F2E6',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Check size={13} /> Excel procesado (+2 materias, +7 cortes)
                </span>
              ) : (
                <button
                  onClick={() => setShowExcelModal(true)}
                  style={{
                    background: '#A9431E',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <FileSpreadsheet size={15} /> Subir Excel de prueba
                </button>
              )}
            </div>
          </div>

          {/* Paso 3: Formulario Manual (3er producto) */}
          <div
            style={{
              padding: '14px',
              borderRadius: '9px',
              border: `1px solid ${formSubmitted ? '#CFE3D0' : '#E1A382'}`,
              background: formSubmitted ? '#F4F9F4' : '#FFF9F5',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: formSubmitted ? '#2F6B45' : '#A9431E',
                  color: '#fff',
                  fontSize: '11px',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 700,
                }}
              >
                {formSubmitted ? <Check size={12} /> : '3'}
              </span>
              <strong style={{ fontSize: '13px' }}>3. Formulario Manual (3er producto)</strong>
            </div>
            <p style={{ fontSize: '12px', color: '#746F6A', margin: '0 0 10px 30px' }}>
              Para el producto restante, formulario interactivo para registrar <em>Pavo Entero</em> y su plantilla personalizada.
            </p>
            <div style={{ marginLeft: '30px' }}>
              {formSubmitted ? (
                <span
                  style={{
                    fontSize: '11px',
                    color: '#2F6B45',
                    fontWeight: 600,
                    background: '#E7F2E6',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Check size={13} /> 3er Producto registrado en catálogo
                </span>
              ) : (
                <button
                  onClick={() => setShowFormModal(true)}
                  style={{
                    background: '#252B2E',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <PlusCircle size={15} /> Abrir Formulario Manual
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Barra de pestañas y herramientas */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '6px', background: '#EAE5DE', padding: '4px', borderRadius: '8px' }}>
          <button
            onClick={() => setActiveTab('products')}
            style={{
              border: 'none',
              background: activeTab === 'products' ? '#fff' : 'transparent',
              color: activeTab === 'products' ? '#242A2D' : '#746F6A',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 650,
              boxShadow: activeTab === 'products' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <BookOpen size={16} /> Productos del Catálogo ({filteredProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            style={{
              border: 'none',
              background: activeTab === 'templates' ? '#fff' : 'transparent',
              color: activeTab === 'templates' ? '#242A2D' : '#746F6A',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 650,
              boxShadow: activeTab === 'templates' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Layers size={16} /> Plantillas de Desposte ({templates.length})
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setShowExcelModal(true)}
            className="subtle-button"
            style={{ color: '#2F6B45', borderColor: '#CFE3D0', background: '#F4F9F4' }}
          >
            <FileSpreadsheet size={16} /> {excelImported ? 'Re-simular Excel' : 'Subir Excel (2 productos)'}
          </button>
          <button
            onClick={() => setShowFormModal(true)}
            className="subtle-button"
            style={{ color: '#A9431E', borderColor: '#E7DED5' }}
          >
            <PlusCircle size={16} /> {formSubmitted ? 'Editar 3er Producto' : '+ Formulario 3er Producto'}
          </button>
        </div>
      </div>

      {/* Contenido según pestaña */}
      {activeTab === 'products' ? (
        <div className="table-panel">
          <div className="table-tools" style={{ flexWrap: 'wrap', gap: '10px' }}>
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Buscar por nombre, SKU o categoría..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ fontSize: '11px', color: '#746F6A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={14} /> Categoría:
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{ border: '1px solid #E7DED5', borderRadius: '6px', padding: '4px 8px', fontSize: '12px' }}
                >
                  <option value="all">Todas las categorías</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ fontSize: '11px', color: '#746F6A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Origen:
                <select
                  value={originFilter}
                  onChange={(e) => setOriginFilter(e.target.value)}
                  style={{ border: '1px solid #E7DED5', borderRadius: '6px', padding: '4px 8px', fontSize: '12px' }}
                >
                  <option value="all">Todos los orígenes</option>
                  <option value="base">Base inicial (3 productos)</option>
                  <option value="excel">Subidos vía Excel (2 materias + 7 cortes)</option>
                  <option value="form">Creado vía Formulario (3er producto)</option>
                </select>
              </label>
            </div>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>
                    <button type="button" onClick={() => handleSort('id')}>
                      SKU / Código {getSortIcon('id')}
                    </button>
                  </th>
                  <th>
                    <button type="button" onClick={() => handleSort('name')}>
                      Nombre del Producto {getSortIcon('name')}
                    </button>
                  </th>
                  <th>
                    <button type="button" onClick={() => handleSort('kind')}>
                      Tipo {getSortIcon('kind')}
                    </button>
                  </th>
                  <th>
                    <button type="button" onClick={() => handleSort('category')}>
                      Categoría {getSortIcon('category')}
                    </button>
                  </th>
                  <th>
                    <button type="button" onClick={() => handleSort('companyId')}>
                      Empresa {getSortIcon('companyId')}
                    </button>
                  </th>
                  <th>
                    <button type="button" onClick={() => handleSort('refCostKgCents')}>
                      Costo Ref. ($/kg) {getSortIcon('refCostKgCents')}
                    </button>
                  </th>
                  <th>
                    <button type="button" onClick={() => handleSort('refPriceKgCents')}>
                      Precio Venta ($/kg) {getSortIcon('refPriceKgCents')}
                    </button>
                  </th>
                  <th>
                    <button type="button" onClick={() => handleSort('origin')}>
                      Origen {getSortIcon('origin')}
                    </button>
                  </th>
                  <th>
                    <button type="button" style={{ cursor: 'default' }}>
                      Plantilla
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((p) => {
                  const companyObj = companies.find((c) => c.id === p.companyId);
                  const linkedTemplate = templates.find((t) => t.rawProductId === p.id);

                  return (
                    <tr key={p.id}>
                      <td>
                        <code style={{ fontSize: '11px', background: '#F5EDE5', padding: '2px 6px', borderRadius: '4px' }}>
                          {p.id}
                        </code>
                      </td>
                      <td>
                        <strong style={{ color: '#242A2D' }}>{p.name}</strong>
                        {p.sourceProductId && (
                          <div style={{ fontSize: '10px', color: '#817B75' }}>
                            Derivado de: <code>{p.sourceProductId}</code>
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background:
                              p.kind === 'raw' ? '#FEE4D7' : p.kind === 'cut' ? '#E7EFF8' : '#F1E9FA',
                            color:
                              p.kind === 'raw' ? '#843315' : p.kind === 'cut' ? '#1D4ED8' : '#6B21A8',
                          }}
                        >
                          {p.kind === 'raw' ? 'Materia Prima' : p.kind === 'cut' ? 'Corte Derivado' : 'Prod. Terminado'}
                        </span>
                      </td>
                      <td>{p.category}</td>
                      <td>{companyObj?.name || p.companyId}</td>
                      <td>{usd(p.refCostKgCents)} / kg</td>
                      <td>
                        <strong style={{ color: '#2F6B45' }}>{usd(p.refPriceKgCents)} / kg</strong>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background:
                              p.origin === 'excel'
                                ? '#E7F2E6'
                                : p.origin === 'form'
                                ? '#FFF3D4'
                                : '#FAF8F5',
                            color:
                              p.origin === 'excel'
                                ? '#2F6B45'
                                : p.origin === 'form'
                                ? '#92400E'
                                : '#746F6A',
                          }}
                        >
                          {p.origin === 'excel'
                            ? 'Excel (.xlsx)'
                            : p.origin === 'form'
                            ? 'Formulario Manual'
                            : 'Base'}
                        </span>
                      </td>
                      <td>
                        {linkedTemplate ? (
                          <button
                            onClick={() => {
                              setSelectedTemplate(linkedTemplate);
                            }}
                            style={{
                              border: '1px solid #D6CEC5',
                              background: '#fff',
                              color: '#A9431E',
                              borderRadius: '6px',
                              padding: '3px 8px',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Eye size={12} /> Ver cortes ({linkedTemplate.items.length})
                          </button>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#BBB4AC' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <span>
              Mostrando {sortedProducts.length} de {products.length} productos en catálogo maestro
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#746F6A' }}>
                Base: {products.filter((p) => p.origin === 'base').length} | Excel:{' '}
                {products.filter((p) => p.origin === 'excel').length} | Formulario:{' '}
                {products.filter((p) => p.origin === 'form').length}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Vista de Plantillas de Desposte */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '18px' }}>
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              style={{
                background: '#fff',
                border: '1px solid #E5DFD7',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                <div>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      color: tpl.origin === 'excel' ? '#2F6B45' : tpl.origin === 'form' ? '#92400E' : '#A9431E',
                    }}
                  >
                    {tpl.origin === 'excel'
                      ? 'IMPORTADO DE EXCEL'
                      : tpl.origin === 'form'
                      ? 'CREADO EN FORMULARIO MANUAL'
                      : 'PLANTILLA BASE'}
                  </span>
                  <h3 style={{ margin: '3px 0 2px', fontSize: '17px', color: '#242A2D' }}>{tpl.name}</h3>
                  <div style={{ fontSize: '12px', color: '#746F6A' }}>
                    Materia prima:{' '}
                    <strong style={{ color: '#242A2D' }}>{tpl.rawProductName}</strong> (<code>{tpl.rawProductId}</code>)
                  </div>
                </div>
                <span
                  style={{
                    background: '#FAF8F5',
                    border: '1px solid #EDE7DF',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 650,
                  }}
                >
                  {tpl.items.length} cortes definidos
                </span>
              </div>

              {/* Barra visual de rendimiento porcentual */}
              <div style={{ margin: '14px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '5px' }}>
                  <span style={{ color: '#746F6A', fontWeight: 600 }}>Distribución teórica del 100% de la canal:</span>
                  <span style={{ color: '#2F6B45', fontWeight: 700 }}>
                    Rendimiento útil: {100 - tpl.wastePercent}% | Merma: {tpl.wastePercent}%
                  </span>
                </div>
                <div
                  style={{
                    height: '18px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    display: 'flex',
                    background: '#EDE7DF',
                  }}
                >
                  {tpl.items.map((item, idx) => {
                    const colors = ['#2F6B45', '#1D4ED8', '#A9431E', '#D97706', '#7C3AED', '#0284C7'];
                    const color = colors[idx % colors.length];
                    return (
                      <div
                        key={item.productId}
                        title={`${item.productName}: ${item.yieldPercent}%`}
                        style={{
                          width: `${item.yieldPercent}%`,
                          background: color,
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: 700,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          padding: '0 2px',
                        }}
                      >
                        {item.yieldPercent >= 10 ? `${item.yieldPercent}%` : ''}
                      </div>
                    );
                  })}
                  {tpl.wastePercent > 0 && (
                    <div
                      title={`Merma técnica: ${tpl.wastePercent}%`}
                      style={{
                        width: `${tpl.wastePercent}%`,
                        background: '#94A3B8',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '10px',
                        fontWeight: 700,
                      }}
                    >
                      {tpl.wastePercent >= 8 ? `${tpl.wastePercent}%` : ''}
                    </div>
                  )}
                </div>
              </div>

              {/* Lista detallada de cortes */}
              <div style={{ borderTop: '1px solid #F0ECE6', paddingTop: '10px', flex: 1 }}>
                <table style={{ width: '100%', fontSize: '12px', minWidth: 'auto' }}>
                  <thead>
                    <tr style={{ background: '#FAF8F5' }}>
                      <th style={{ padding: '8px 12px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#746F6A' }}>
                        Corte derivado
                      </th>
                      <th style={{ padding: '8px 12px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#746F6A', textAlign: 'center' }}>
                        % Rendimiento
                      </th>
                      <th style={{ padding: '8px 12px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#746F6A', textAlign: 'right' }}>
                        P. Venta Ref.
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tpl.items.map((item) => (
                      <tr key={item.productId} style={{ background: 'transparent' }}>
                        <td style={{ padding: '9px 12px', borderBottom: '1px solid #F5EDE5' }}>
                          <strong>{item.productName}</strong>
                          <div style={{ fontSize: '10px', color: '#817B75' }}>
                            <code>{item.productId}</code>
                          </div>
                        </td>
                        <td style={{ padding: '9px 12px', textAlign: 'center', borderBottom: '1px solid #F5EDE5', fontWeight: 650 }}>
                          {item.yieldPercent}%
                        </td>
                        <td style={{ padding: '9px 12px', textAlign: 'right', borderBottom: '1px solid #F5EDE5', color: '#2F6B45', fontWeight: 650 }}>
                          {usd(item.refPriceKgCents)} / kg
                        </td>
                      </tr>
                    ))}
                    {tpl.wastePercent > 0 && (
                      <tr style={{ background: 'transparent' }}>
                        <td style={{ padding: '9px 12px', color: '#64748B' }}>
                          <em>Merma técnica esperada (hueso, cebo, evaporación)</em>
                        </td>
                        <td style={{ padding: '9px 12px', textAlign: 'center', color: '#64748B', fontWeight: 600 }}>
                          {tpl.wastePercent}%
                        </td>
                        <td style={{ padding: '9px 12px', textAlign: 'right', color: '#64748B' }}>$0,00</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div
                style={{
                  marginTop: '14px',
                  background: '#FAF8F5',
                  padding: '10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#746F6A',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>Base de cálculo: por cada 100 kg recibidos</span>
                <strong style={{ color: '#242A2D' }}>
                  {100 - tpl.wastePercent} kg aprovechables + {tpl.wastePercent} kg merma
                </strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: SIMULACIÓN DE SUBIDA DE EXCEL (2 PRODUCTOS) */}
      {showExcelModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(27, 32, 35, 0.65)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 100,
            padding: '20px',
          }}
          onClick={() => setShowExcelModal(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '14px',
              maxWidth: '750px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              padding: '28px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: '#E7F2E6',
                    color: '#2F6B45',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <FileSpreadsheet size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '19px', color: '#242A2D' }}>
                    Simulación de Importación Masiva desde Excel
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#746F6A' }}>
                    Archivo detectado: <code>{excelSimulatedPackage.filename}</code>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExcelModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#746F6A', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Ficha del archivo simulado */}
            <div
              style={{
                border: '2px dashed #CFE3D0',
                background: '#F7FAF7',
                padding: '16px',
                borderRadius: '9px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#E7F2E6', display: 'grid', placeItems: 'center', color: '#2F6B45' }}>
                <FileCheck size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#242A2D' }}>
                  Estructura validada correctamente (2 materias primas + 7 cortes derivados)
                </div>
                <div style={{ fontSize: '12px', color: '#746F6A' }}>
                  Hojas: <code>Productos_Maestro</code> y <code>Plantillas_Desposte_2026</code> · Formato compatible con Clearminds
                </div>
              </div>
              <span style={{ fontSize: '11px', background: '#2F6B45', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontWeight: 700 }}>
                2 PRODUCTOS LISTOS
              </span>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#A9431E', letterSpacing: '0.06em', marginBottom: '10px' }}>
                PREVISUALIZACIÓN DE LOS 2 PRODUCTOS Y SUS PLANTILLAS DE CORTES:
              </div>

              {/* Producto 1 de Excel */}
              <div
                style={{
                  border: '1px solid #EDE7DF',
                  borderRadius: '9px',
                  padding: '14px',
                  marginBottom: '12px',
                  background: '#FAF8F5',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '10px', background: '#E7EFF8', color: '#1D4ED8', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      PRODUCTO 1 · OVINO
                    </span>
                    <strong style={{ marginLeft: '8px', fontSize: '14px' }}>Cordero en Canal</strong>{' '}
                    <code>(cordero-canal)</code>
                  </div>
                  <div style={{ fontSize: '12px', color: '#746F6A' }}>
                    Costo compra ref: <strong>$4.50/kg</strong>
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#746F6A', marginBottom: '6px' }}>
                  Plantilla de desposte asociada: <strong>Plantilla Desposte Cordero Ovino Prémium</strong>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', background: '#fff', border: '1px solid #E5DFD7', padding: '3px 8px', borderRadius: '4px' }}>
                    Pierna de Cordero: <strong>35% ($11.50/kg)</strong>
                  </span>
                  <span style={{ fontSize: '11px', background: '#fff', border: '1px solid #E5DFD7', padding: '3px 8px', borderRadius: '4px' }}>
                    Chuletillas: <strong>30% ($9.80/kg)</strong>
                  </span>
                  <span style={{ fontSize: '11px', background: '#fff', border: '1px solid #E5DFD7', padding: '3px 8px', borderRadius: '4px' }}>
                    Paletilla: <strong>20% ($7.50/kg)</strong>
                  </span>
                  <span style={{ fontSize: '11px', background: '#FAF3ED', color: '#A9431E', padding: '3px 8px', borderRadius: '4px' }}>
                    Merma técnica: <strong>15%</strong>
                  </span>
                </div>
              </div>

              {/* Producto 2 de Excel */}
              <div
                style={{
                  border: '1px solid #EDE7DF',
                  borderRadius: '9px',
                  padding: '14px',
                  background: '#FAF8F5',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '10px', background: '#FEF3C7', color: '#B45309', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      PRODUCTO 2 · AVIAR
                    </span>
                    <strong style={{ marginLeft: '8px', fontSize: '14px' }}>Pollo Beneficiado Entero</strong>{' '}
                    <code>(pollo-entero)</code>
                  </div>
                  <div style={{ fontSize: '12px', color: '#746F6A' }}>
                    Costo compra ref: <strong>$2.10/kg</strong>
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#746F6A', marginBottom: '6px' }}>
                  Plantilla de desposte asociada: <strong>Plantilla Despiece Integral de Pollo</strong>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', background: '#fff', border: '1px solid #E5DFD7', padding: '3px 8px', borderRadius: '4px' }}>
                    Pechuga Fileteada: <strong>32% ($5.80/kg)</strong>
                  </span>
                  <span style={{ fontSize: '11px', background: '#fff', border: '1px solid #E5DFD7', padding: '3px 8px', borderRadius: '4px' }}>
                    Cuartos Traseros: <strong>30% ($4.40/kg)</strong>
                  </span>
                  <span style={{ fontSize: '11px', background: '#fff', border: '1px solid #E5DFD7', padding: '3px 8px', borderRadius: '4px' }}>
                    Alitas: <strong>14% ($4.90/kg)</strong>
                  </span>
                  <span style={{ fontSize: '11px', background: '#fff', border: '1px solid #E5DFD7', padding: '3px 8px', borderRadius: '4px' }}>
                    Carcasa/Menudencias: <strong>18% ($1.80/kg)</strong>
                  </span>
                  <span style={{ fontSize: '11px', background: '#FAF3ED', color: '#A9431E', padding: '3px 8px', borderRadius: '4px' }}>
                    Merma: <strong>6%</strong>
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #F0ECE6', paddingTop: '16px' }}>
              <button
                onClick={() => setShowExcelModal(false)}
                className="subtle-button"
                style={{ color: '#746F6A', border: '1px solid #D6CEC5' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmExcel}
                style={{
                  background: '#2F6B45',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 22px',
                  borderRadius: '7px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <CheckCircle2 size={16} /> Confirmar e Importar al Catálogo (2 Productos)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: FORMULARIO MANUAL PARA EL 3ER PRODUCTO */}
      {showFormModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(27, 32, 35, 0.65)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 100,
            padding: '20px',
          }}
          onClick={() => setShowFormModal(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '14px',
              maxWidth: '820px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              padding: '28px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: '#FBE7DC',
                    color: '#A9431E',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <PlusCircle size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '19px', color: '#242A2D' }}>
                    Formulario de Alta Manual · 3er Producto
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#746F6A' }}>
                    Carga unitaria para completar el flujo de simulación de materias primas y plantilla de cortes.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#746F6A', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Aviso informativo limpio sin emojis */}
            <div
              style={{
                background: '#FAF3ED',
                border: '1px solid #F4D5C5',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#843315' }}>
                <Info size={16} color="#A9431E" />
                <span>Puedes ingresar datos personalizados o utilizar el autocompletado del 3er producto sugerido (Pavo Entero).</span>
              </div>
              <button
                type="button"
                onClick={fillSampleThirdProduct}
                style={{
                  background: '#A9431E',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '5px',
                  fontSize: '11px',
                  fontWeight: 650,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={13} /> Rellenar Pavo Entero
              </button>
            </div>

            <form onSubmit={handleSaveForm}>
              {/* Sección A: Datos Generales */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: '#A9431E', letterSpacing: '0.06em' }}>
                  1. DATOS DE LA MATERIA PRIMA ENTRADA
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 650, color: '#746F6A', marginBottom: '4px' }}>
                      Nombre del Producto:
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #E7DED5', borderRadius: '6px', fontSize: '12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 650, color: '#746F6A', marginBottom: '4px' }}>
                      SKU / Identificador Único:
                    </label>
                    <input
                      type="text"
                      required
                      value={formId}
                      onChange={(e) => setFormId(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #E7DED5', borderRadius: '6px', fontSize: '12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 650, color: '#746F6A', marginBottom: '4px' }}>
                      Categoría / Especie:
                    </label>
                    <input
                      type="text"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #E7DED5', borderRadius: '6px', fontSize: '12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 650, color: '#746F6A', marginBottom: '4px' }}>
                      Empresa Propietaria:
                    </label>
                    <select
                      value={formCompany}
                      onChange={(e) => setFormCompany(e.target.value as CompanyId)}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #E7DED5', borderRadius: '6px', fontSize: '12px' }}
                    >
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 650, color: '#746F6A', marginBottom: '4px' }}>
                      Costo Compra Estimado ($/kg):
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formCost}
                      onChange={(e) => setFormCost(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #E7DED5', borderRadius: '6px', fontSize: '12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 650, color: '#746F6A', marginBottom: '4px' }}>
                      Precio Venta Canal Entera ($/kg):
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #E7DED5', borderRadius: '6px', fontSize: '12px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Sección B: Plantilla de Desposte */}
              <div style={{ marginBottom: '20px', borderTop: '1px solid #F0ECE6', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0, fontSize: '13px', color: '#A9431E', letterSpacing: '0.06em' }}>
                    2. PLANTILLA DE DESPOSTE Y CORTES RESULTANTES
                  </h4>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: isYieldBalanced ? '#E7F2E6' : '#FEF3C7',
                      color: isYieldBalanced ? '#2F6B45' : '#B45309',
                    }}
                  >
                    {isYieldBalanced ? <Check size={14} /> : <AlertCircle size={14} />}
                    <span>Suma total: {totalYield}% {isYieldBalanced ? '(100% Equilibrado)' : '(Debe sumar 100%)'}</span>
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 650, color: '#746F6A', marginBottom: '4px' }}>
                    Nombre de la Plantilla de Desposte:
                  </label>
                  <input
                    type="text"
                    required
                    value={formTemplateName}
                    onChange={(e) => setFormTemplateName(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #E7DED5', borderRadius: '6px', fontSize: '12px' }}
                  />
                </div>

                <div style={{ display: 'grid', gap: '8px', marginBottom: '12px' }}>
                  {formCuts.map((cut, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.5fr 1fr 100px 100px 32px',
                        gap: '8px',
                        alignItems: 'center',
                        background: '#FAF8F5',
                        padding: '8px 10px',
                        borderRadius: '6px',
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Nombre del corte derivado"
                        value={cut.name}
                        onChange={(e) => {
                          const newCuts = [...formCuts];
                          newCuts[index].name = e.target.value;
                          setFormCuts(newCuts);
                        }}
                        style={{ padding: '6px 8px', border: '1px solid #E7DED5', borderRadius: '4px', fontSize: '12px' }}
                      />

                      <input
                        type="text"
                        placeholder="SKU corte"
                        value={cut.id}
                        onChange={(e) => {
                          const newCuts = [...formCuts];
                          newCuts[index].id = e.target.value;
                          setFormCuts(newCuts);
                        }}
                        style={{ padding: '6px 8px', border: '1px solid #E7DED5', borderRadius: '4px', fontSize: '11px' }}
                      />

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          placeholder="%"
                          value={cut.yieldPercent}
                          onChange={(e) => {
                            const newCuts = [...formCuts];
                            newCuts[index].yieldPercent = Number(e.target.value);
                            setFormCuts(newCuts);
                          }}
                          style={{ width: '60px', padding: '6px 8px', border: '1px solid #E7DED5', borderRadius: '4px', fontSize: '12px' }}
                        />
                        <span style={{ fontSize: '11px', color: '#746F6A' }}>%</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#746F6A' }}>$</span>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="$/kg"
                          value={cut.price}
                          onChange={(e) => {
                            const newCuts = [...formCuts];
                            newCuts[index].price = e.target.value;
                            setFormCuts(newCuts);
                          }}
                          style={{ width: '70px', padding: '6px 8px', border: '1px solid #E7DED5', borderRadius: '4px', fontSize: '12px' }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (formCuts.length > 1) {
                            setFormCuts(formCuts.filter((_, idx) => idx !== index));
                          }
                        }}
                        style={{ background: 'transparent', border: 'none', color: '#B45309', cursor: 'pointer', padding: 0 }}
                        title="Eliminar corte"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setFormCuts([
                        ...formCuts,
                        { id: `corte-${formCuts.length + 1}`, name: `Nuevo Corte ${formCuts.length + 1}`, yieldPercent: 10, price: '6.00' },
                      ]);
                    }}
                    style={{
                      border: '1px dashed #A9431E',
                      background: 'transparent',
                      color: '#A9431E',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '11px',
                      fontWeight: 650,
                      cursor: 'pointer',
                    }}
                  >
                    + Agregar otro corte derivado
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '11px', color: '#746F6A', fontWeight: 650 }}>
                      Merma técnica esperada (%):
                    </label>
                    <input
                      type="number"
                      value={formWastePercent}
                      onChange={(e) => setFormWastePercent(Number(e.target.value))}
                      style={{ width: '60px', padding: '6px 8px', border: '1px solid #E7DED5', borderRadius: '4px', fontSize: '12px' }}
                    />
                    <span style={{ fontSize: '11px', color: '#746F6A' }}>%</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #F0ECE6', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="subtle-button"
                  style={{ color: '#746F6A', border: '1px solid #D6CEC5' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!isYieldBalanced}
                  style={{
                    background: isYieldBalanced ? '#A9431E' : '#C9C3BB',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 22px',
                    borderRadius: '7px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: isYieldBalanced ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <CheckCircle2 size={16} /> Guardar 3er Producto en Catálogo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VISTA DE DETALLE DE PLANTILLA INDIVIDUAL */}
      {selectedTemplate && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(27, 32, 35, 0.65)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 100,
            padding: '20px',
          }}
          onClick={() => setSelectedTemplate(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '14px',
              maxWidth: '600px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#A9431E' }}>FICHA TÉCNICA DE DESPOSTE</span>
                <h3 style={{ margin: '2px 0', fontSize: '18px', color: '#242A2D' }}>{selectedTemplate.name}</h3>
                <div style={{ fontSize: '12px', color: '#746F6A' }}>
                  Para: <strong>{selectedTemplate.rawProductName}</strong> (<code>{selectedTemplate.rawProductId}</code>)
                </div>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                style={{ background: 'transparent', border: 'none', color: '#746F6A', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ margin: '14px 0' }}>
              <table style={{ width: '100%', fontSize: '12px', minWidth: 'auto' }}>
                <thead>
                  <tr style={{ background: '#FAF8F5' }}>
                    <th style={{ padding: '8px 12px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#746F6A' }}>
                      Corte
                    </th>
                    <th style={{ padding: '8px 12px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#746F6A', textAlign: 'center' }}>
                      % Rendimiento
                    </th>
                    <th style={{ padding: '8px 12px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#746F6A', textAlign: 'right' }}>
                      P. Venta Ref.
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTemplate.items.map((item) => (
                    <tr key={item.productId}>
                      <td style={{ padding: '8px 12px' }}>
                        <strong>{item.productName}</strong>
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 650 }}>{item.yieldPercent}%</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: '#2F6B45', fontWeight: 650 }}>
                        {usd(item.refPriceKgCents)} / kg
                      </td>
                    </tr>
                  ))}
                  {selectedTemplate.wastePercent > 0 && (
                    <tr style={{ background: '#FAF8F5' }}>
                      <td style={{ padding: '8px 12px', color: '#64748B' }}>Merma técnica estándar</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', color: '#64748B', fontWeight: 650 }}>
                        {selectedTemplate.wastePercent}%
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: '#64748B' }}>—</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                onClick={() => setSelectedTemplate(null)}
                style={{
                  background: '#252B2E',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 650,
                  cursor: 'pointer',
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
