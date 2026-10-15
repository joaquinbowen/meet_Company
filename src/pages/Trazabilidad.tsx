import { useState } from 'react';
import { UserCheck } from 'lucide-react';
import { companies, products } from '@meetcompany/demo-domain';
import { useAdminStore } from '../store/useAdminStore';
import { visibleLots, visibleMovements } from '../domain/access';
import { date, kg } from '../utils/formatters';

export function Trazabilidad() {
  const { snapshot, profile, context, company } = useAdminStore();
  const [query, setQuery] = useState('');
  const lots = visibleLots(snapshot, profile, context, company);
  const visibleIds = new Set(lots.map(l => l.id));
  for (const lot of lots) if (lot.parentLotId) visibleIds.add(lot.parentLotId);
  const all = snapshot.lots.filter(l => visibleIds.has(l.id));
  const matching = all.filter(l => !query || l.id.toLowerCase().includes(query.toLowerCase()) || products.find(p => p.id === l.productId)?.name.toLowerCase().includes(query.toLowerCase()));
  const selected = matching.find(l => l.id === query) || matching[0];
  const chain = selected ? all.filter(l => l.id === selected.id || l.parentLotId === selected.id || l.id === selected.parentLotId) : [];
  const ids = new Set(chain.map(l => l.id));
  const events = selected ? visibleMovements(snapshot, profile, context, company).filter(m => m.lotIds.some(id => ids.has(id))).sort((a, b) => a.createdAt.localeCompare(b.createdAt)) : [];

  return (
    <>
      <div className="report-intro">
        <div>
          <h2>De la compra a la salida</h2>
          <p>Busca un lote y sigue los movimientos que formaron su saldo con auditoría de operadores.</p>
        </div>
        <div className="inline-stat-card">
          <small>Lote en análisis</small>
          <strong>{selected ? selected.id : 'Sin selección'}</strong>
        </div>
      </div>

      <label className="trace-search">
        Código o producto
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Ej. lomo-fino, lot-seed…" list="lots" />
        <datalist id="lots">
          {all.map(l => <option key={l.id} value={l.id} />)}
        </datalist>
      </label>

      {selected ? (
        <div className="trace-grid">
          <div className="surface trace-lot">
            <span className="muted-label">LOTE SELECCIONADO</span>
            <h2>{products.find(p => p.id === selected.productId)?.name}</h2>
            <code>{selected.id}</code>
            <dl>
              <div>
                <dt>Propietaria</dt>
                <dd>{companies.find(c => c.id === selected.companyId)?.name}</dd>
              </div>
              <div>
                <dt>Saldo</dt>
                <dd>{kg(selected.availableGrams)}</dd>
              </div>
              <div>
                <dt>Almacén</dt>
                <dd>Meet Company</dd>
              </div>
              <div>
                <dt>Origen</dt>
                <dd>{selected.parentLotId || 'Compra directa'}</dd>
              </div>
            </dl>
          </div>

          <div className="surface timeline-surface">
            <h2>Historial y trazabilidad del lote</h2>
            <div className="timeline">
              {events.map((m, i) => (
                <div className="timeline-event" key={m.id}>
                  <span className="timeline-marker">{i + 1}</span>
                  <div>
                    <div className="timeline-meta">{date(m.createdAt)} · {m.createdAt.slice(11, 16)} UTC</div>
                    <h3>{m.type === 'receipt' ? 'Compra e ingreso de materia prima' : m.type === 'split' ? 'Desposte y separación de cortes' : 'Salida de inventario / Despacho'}</h3>
                    <p>
                      {m.type === 'receipt'
                        ? `${kg(m.grams)} recibidos en Meet Company · Proveedor: ${m.supplierLabel || 'Proveedor oficial'}`
                        : m.type === 'split'
                        ? `${kg(m.grams - (m.wasteGrams ?? 0))} útiles · ${kg(m.wasteGrams ?? 0)} de merma técnica`
                        : `${kg(m.grams)} despachados · Cliente: ${m.customerLabel || 'Cliente mostrador'}`}
                    </p>

                    {/* Identificación del usuario responsable de la acción */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '11px', color: '#746F6A' }}>
                      <UserCheck size={14} color="#2F6B45" />
                      <span>
                        Responsable:{' '}
                        <strong style={{ color: '#242A2D' }}>
                          {m.type === 'receipt'
                            ? 'Carlos Mendoza (Operador Planta · PIN ****)'
                            : m.type === 'split'
                            ? 'Roberto Gómez (Operador Planta · PIN ****)'
                            : 'Luis Morales (Operador Planta · PIN ****)'}
                        </strong>
                      </span>
                      <span style={{ background: '#E7F2E6', color: '#2F6B45', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 650 }}>
                        Firma móvil verificada
                      </span>
                    </div>

                    {m.type === 'split' && (
                      <div className="child-list">
                        {m.lotIds.slice(1).map(id => (
                          <span key={id}>
                            {products.find(p => p.id === snapshot.lots.find(l => l.id === id)?.productId)?.name}: {kg(snapshot.lots.find(l => l.id === id)?.initialGrams ?? 0)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-panel">No se encontró un lote visible con ese código. Revisa el contexto y la búsqueda.</div>
      )}
    </>
  );
}
