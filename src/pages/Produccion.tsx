import { useState } from 'react';
import { companies } from '@meetcompany/demo-domain';
import { useAdminStore } from '../store/useAdminStore';
import { reportData } from '../domain/aggregators';
import { DataTable, type Column } from '../components/DataTable';
import { date, kg, percent } from '../utils/formatters';
type Row={id:string;company:string;parent:string;date:string;input:number;useful:number;waste:number};
export function Produccion(){const {snapshot,profile,context,company}=useAdminStore(); const [from,setFrom]=useState('2026-10-14');const [to,setTo]=useState('2026-10-14');const data=reportData(snapshot,profile,context,company);
 const rows:Row[]=data.movements.filter(m=>m.type==='split'&&m.createdAt.slice(0,10)>=from&&m.createdAt.slice(0,10)<=to).map(m=>({id:m.id,company:companies.find(c=>c.id===m.companyId)?.name||m.companyId,parent:m.lotIds[0],date:m.createdAt,input:m.grams,useful:m.grams-(m.wasteGrams??0),waste:m.wasteGrams??0}));
 const cols:Column<Row>[]=[{key:'date',label:'Fecha',text:r=>date(r.date),sort:r=>r.date},{key:'company',label:'Empresa',text:r=>r.company},{key:'parent',label:'Lote origen',text:r=>r.parent},{key:'input',label:'Procesado',text:r=>kg(r.input),sort:r=>r.input},{key:'useful',label:'Útil',text:r=>kg(r.useful),sort:r=>r.useful},{key:'waste',label:'Merma',text:r=>kg(r.waste),sort:r=>r.waste},{key:'yield',label:'Rendimiento',text:r=>percent(r.useful,r.input),sort:r=>r.useful/r.input}];
 return <><div className="report-intro"><div><h2>Transformación de materia prima</h2><p>Cada fila corresponde a un desposte completo registrado en el escenario.</p></div><div className="inline-stat-card"><small>Despostes en periodo</small><strong>{rows.length} {rows.length === 1 ? 'proceso' : 'procesos'}</strong></div></div><div className="filter-bar"><label>Desde<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label><label>Hasta<input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label></div><DataTable rows={rows} columns={cols} csvName="meetcompany-produccion.csv"/>{!rows.length && <p className="explain-empty">Finilong compra producto terminado; no registra desposte. Ajusta el periodo o el contexto para ver otros procesos.</p>}</>
}
