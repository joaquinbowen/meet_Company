import { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { allocateLotCosts, companies, products } from '@meetcompany/demo-domain';
import { DataTable, type Column } from '../components/DataTable';
import { visibleMovements } from '../domain/access';
import { useAdminStore } from '../store/useAdminStore';
import { date, kg, usd } from '../utils/formatters';

// Precios de venta unitarios simulados para todos los productos hardcodeados (en centavos por kg)
export const simulatedSalePricesCentsPerKg: Record<string, { priceCents: number; label: string }> = {
  'lomo-fino': { priceCents: 950, label: '$9.50/kg' },
  'churrasco': { priceCents: 680, label: '$6.80/kg' },
  'carne-guiso': { priceCents: 520, label: '$5.20/kg' },
  'chuletas-cerdo': { priceCents: 480, label: '$4.80/kg' },
  'costillas': { priceCents: 550, label: '$5.50/kg' },
  'pierna': { priceCents: 420, label: '$4.20/kg' },
  'lomo-importado': { priceCents: 1500, label: '$15.00/kg' },
  'res-entera': { priceCents: 450, label: '$4.50/kg' },
  'cerdo-canal': { priceCents: 380, label: '$3.80/kg' },
};

type Row = {
  id: string;
  company: string;
  product: string;
  productId: string;
  customer: string;
  date: string;
  grams: number;
  cost: number;
  unitPriceCents: number;
  revenue: number;
  margin: number;
  marginPercent: number;
};

export function Rentabilidad() {
  const { snapshot, profile, context, company } = useAdminStore();
  const [from, setFrom] = useState('2026-10-14');
  const [to, setTo] = useState('2026-10-14');
  const costMap = new Map(allocateLotCosts(snapshot).map(c => [c.lotId, c]));

  const rows: Row[] = visibleMovements(snapshot, profile, context, company)
    .filter(m => m.type === 'dispatch' && m.createdAt.slice(0, 10) >= from && m.createdAt.slice(0, 10) <= to)
    .map(m => {
      const lot = snapshot.lots.find(l => l.id === m.lotIds[0])!;
      const cost = costMap.get(lot.id)!;
      const totalDispatched = snapshot.movements
        .filter(x => x.type === 'dispatch' && x.lotIds[0] === lot.id)
        .reduce((n, x) => n + x.grams, 0);
      const after = Math.round(cost.initialCostCents * (lot.initialGrams - totalDispatched) / lot.initialGrams);
      const allocatedCost = cost.initialCostCents - after;

      const priceConfig = simulatedSalePricesCentsPerKg[lot.productId] ?? { priceCents: 600, label: '$6.00/kg' };
      const revenue = Math.round((m.grams / 1000) * priceConfig.priceCents);
      const margin = revenue - allocatedCost;
      const marginPercent = revenue > 0 ? (margin / revenue) * 100 : 0;

      return {
        id: m.id,
        company: companies.find(c => c.id === m.companyId)?.name || m.companyId,
        product: products.find(p => p.id === lot.productId)?.name || lot.productId,
        productId: lot.productId,
        customer: m.customerLabel || 'No registrado',
        date: m.createdAt,
        grams: m.grams,
        cost: allocatedCost,
        unitPriceCents: priceConfig.priceCents,
        revenue,
        margin,
        marginPercent,
      };
    });

  const totalGrams = rows.reduce((acc, r) => acc + r.grams, 0);
  const totalCost = rows.reduce((acc, r) => acc + r.cost, 0);
  const totalRevenue = rows.reduce((acc, r) => acc + r.revenue, 0);
  const totalMargin = totalRevenue - totalCost;
  const overallMarginPercent = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;

  // Datos para el gráfico de línea cronológico
  const timelineData = rows.map((r, index) => {
    const timeLabel = r.date.slice(11, 16) || `0${index + 8}:00`;
    return {
      name: `${timeLabel} · ${r.product}`,
      time: timeLabel,
      product: r.product,
      ingresos: Math.round(r.revenue / 100),
      costos: Math.round(r.cost / 100),
      margen: Math.round(r.margin / 100),
      kg: Number((r.grams / 1000).toFixed(1)),
    };
  });

  const columns: Column<Row>[] = [
    { key: 'date', label: 'Fecha', text: r => date(r.date), sort: r => r.date },
    { key: 'company', label: 'Empresa', text: r => r.company },
    { key: 'product', label: 'Producto despachado', text: r => r.product },
    { key: 'customer', label: 'Cliente', text: r => r.customer },
    { key: 'kg', label: 'Despachado', text: r => kg(r.grams), sort: r => r.grams },
    { key: 'unitPrice', label: 'P. Venta Ref.', text: r => `${usd(r.unitPriceCents)}/kg`, sort: r => r.unitPriceCents },
    { key: 'cost', label: 'Costo asignado', text: r => usd(r.cost), sort: r => r.cost },
    { key: 'revenue', label: 'Ingreso estimado', text: r => usd(r.revenue), sort: r => r.revenue },
    {
      key: 'margin',
      label: 'Margen bruto',
      text: r => `${usd(r.margin)} (${r.marginPercent >= 0 ? '+' : ''}${r.marginPercent.toFixed(1)}%)`,
      sort: r => r.margin,
    },
  ];

  return (
    <>
      <div className="report-intro">
        <div>
          <h2>Rentabilidad, ingresos y márgenes</h2>
          <p>Simulación económica completa para todos los productos y despachos activos en planta.</p>
        </div>
        <div className="inline-stat-card">
          <small>Despachos con margen</small>
          <strong>{rows.length} órdenes evaluadas</strong>
        </div>
      </div>

      <section className="metric-ribbon" style={{ marginBottom: '22px' }}>
        <div className="metric-primary">
          <span>MARGEN BRUTO SIMULADO</span>
          <strong>{usd(totalMargin)}</strong>
          <small>{overallMarginPercent.toFixed(1)}% margen global sobre ventas</small>
        </div>
        <div>
          <span>TOTAL INGRESOS</span>
          <strong>{usd(totalRevenue)}</strong>
          <small>Precios de venta de mercado</small>
        </div>
        <div>
          <span>COSTO ASIGNADO</span>
          <strong>{usd(totalCost)}</strong>
          <small>Prorrateo de materia prima</small>
        </div>
        <div>
          <span>VOLUMEN DESPACHADO</span>
          <strong>{kg(totalGrams)}</strong>
          <small>{rows.length} órdenes de entrega</small>
        </div>
      </section>

      {/* Gráfico de línea temporal de KPIs */}
      <section className="surface chart-surface" style={{ marginBottom: '22px', padding: '20px 24px' }}>
        <div className="section-head">
          <div>
            <h2>Evolución de rentabilidad en el tiempo</h2>
            <p>Comportamiento cronológico de ingresos, costos y margen bruto a lo largo de las órdenes del periodo.</p>
          </div>
          <span className="section-tag">{rows.length} despachos simulados</span>
        </div>

        {timelineData.length > 0 ? (
          <div style={{ width: '100%', height: 280, marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ top: 12, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDE7DF" />
                <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: '#EDE7DF' }} fontSize={11} stroke="#746F6A" />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: '#EDE7DF' }}
                  fontSize={11}
                  stroke="#746F6A"
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `$${Number(value).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`,
                    name === 'ingresos' ? 'Ingreso estimado' : name === 'costos' ? 'Costo asignado' : 'Margen bruto',
                  ]}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5DFD7', fontSize: '12px' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  formatter={(value) =>
                    value === 'ingresos' ? 'Ingresos ($)' : value === 'costos' ? 'Costo Asignado ($)' : 'Margen Bruto ($)'
                  }
                />
                <Line
                  type="monotone"
                  dataKey="ingresos"
                  stroke="#2F6B45"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#2F6B45' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="costos"
                  stroke="#A9431E"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 4, fill: '#A9431E' }}
                />
                <Line
                  type="monotone"
                  dataKey="margen"
                  stroke="#1D4ED8"
                  strokeWidth={2.5}
                  dot={{ r: 5, fill: '#1D4ED8' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="chart-empty">No hay despachos con margen en el rango de fechas seleccionado.</div>
        )}
      </section>

      <div className="filter-bar">
        <label>
          Desde
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
        </label>
        <label>
          Hasta
          <input type="date" value={to} onChange={e => setTo(e.target.value)} />
        </label>
        <span style={{ color: '#2F6B45', background: '#E7F2E6', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
          ✓ Precios de venta asignados a todos los cortes
        </span>
      </div>

      <DataTable rows={rows} columns={columns} csvName="meetcompany-rentabilidad.csv" />

      <p className="method-note">
        <strong>Metodología de cálculo:</strong> El costo de cada salida utiliza el prorrateo contable por peso útil resultante del desposte o recepción directa. Los ingresos y márgenes se simulan a partir del tarifario comercial de referencia asignado a cada producto en el catálogo de planta.
      </p>
    </>
  );
}
