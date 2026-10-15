import { BrowserRouter, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { BarChart3, BookOpen, Boxes, ChartNoAxesCombined, ChevronDown, ClipboardList, LayoutDashboard, Menu, RefreshCcw, Users, X } from 'lucide-react';
import { companies, type CompanyId } from '@meetcompany/demo-domain';
import { useAdminStore, type Context, type Profile } from './store/useAdminStore';
import { lazy, Suspense, useState } from 'react';
import { Button } from './components/ui/button';
import './styles.css';

const nav = [
  { path: '/', label: 'Panel general', icon: LayoutDashboard },
  { path: '/produccion', label: 'Producción', icon: ChartNoAxesCombined },
  { path: '/inventario', label: 'Inventario', icon: Boxes },
  { path: '/trazabilidad', label: 'Trazabilidad', icon: ClipboardList },
  { path: '/rentabilidad', label: 'Rentabilidad', icon: BarChart3 },
  { path: '/catalogo', label: 'Catálogo', icon: BookOpen },
  { path: '/usuarios', label: 'Usuarios', icon: Users },
];
const Dashboard = lazy(() => import('./pages/Dashboard').then((module) => ({ default: module.Dashboard })));
const Produccion = lazy(() => import('./pages/Produccion').then((module) => ({ default: module.Produccion })));
const Inventario = lazy(() => import('./pages/Inventario').then((module) => ({ default: module.Inventario })));
const Trazabilidad = lazy(() => import('./pages/Trazabilidad').then((module) => ({ default: module.Trazabilidad })));
const Rentabilidad = lazy(() => import('./pages/Rentabilidad').then((module) => ({ default: module.Rentabilidad })));
const CatalogoPlantillas = lazy(() => import('./pages/CatalogoPlantillas').then((module) => ({ default: module.CatalogoPlantillas })));
const Usuarios = lazy(() => import('./pages/Usuarios').then((module) => ({ default: module.Usuarios })));

const names: Record<Context, string> = { group: 'Consolidado Grupo Rodrigo', warehouse: 'Almacén físico · Meet Company', meet: 'Meet Company · propietaria', rodrigo: 'Rodrigo', quality: 'Quality', finilong: 'Finilong' };
const roles: Record<Profile, string> = { management: 'Gerencia', 'company-admin': 'Administrador de empresa', 'warehouse-chief': 'Jefe de almacén' };

function Shell() {
  const location = useLocation();
  const [menu, setMenu] = useState(false);
  const { profile, context, company, stage, syncedAt, syncing, setProfile, setContext, setCompany, setStage, simulateSync } = useAdminStore();
  const current = nav.find((item) => item.path === location.pathname)?.label ?? 'Panel general';
  const contexts: Context[] = profile === 'management' ? ['group', 'warehouse', 'meet', 'rodrigo', 'quality', 'finilong'] : profile === 'warehouse-chief' ? ['warehouse'] : [company];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menu ? 'is-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><span/><span/><span/></div>
          <div><strong>MEET COMPANY</strong><small>CONTROL DE PLANTA</small></div>
          <button className="mobile-close" onClick={() => setMenu(false)} aria-label="Cerrar menú"><X size={20}/></button>
        </div>
        <div className="side-caption">OPERACIÓN Y ANÁLISIS</div>
        <nav aria-label="Navegación principal">
          {nav.filter((item) => profile !== 'warehouse-chief' || item.path !== '/rentabilidad').map(({path,label,icon:Icon}) => (
            <NavLink key={path} to={path} end={path === '/'} onClick={() => setMenu(false)} className={({isActive}) => `side-link ${isActive ? 'active' : ''}`}>
              <Icon size={19} strokeWidth={1.8}/><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="scenario-mark"><span className="status-dot"/>DATOS SIMULADOS</div>
          <p>Tres empresas. Un almacén físico. Cada kilo tiene una historia.</p>
          <span>ESCENARIO · 14 OCT 2026</span>
        </div>
      </aside>

      {menu && <button className="menu-overlay" aria-label="Cerrar navegación" onClick={() => setMenu(false)}/>}

      <div className="main-column">
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={() => setMenu(true)} aria-label="Abrir menú"><Menu size={22}/></button>
            <div className="breadcrumb">PLANTA <span>/</span> <strong>{current.toUpperCase()}</strong></div>
          </div>
          <div className="topbar-right">
            <span className="warehouse-label">Almacén físico: <b>Meet Company</b></span>
            <div className="avatar">{profile === 'management' ? 'CH' : profile === 'company-admin' ? 'AE' : 'JA'}</div>
            <span className="profile-short">{profile === 'management' ? 'Celedonio H.' : roles[profile]}</span>
          </div>
        </header>

        <main className="content">
          <div className="page-heading">
            <div>
              <h1>{current}</h1>
              <p>
                {location.pathname === '/'
                  ? 'Una lectura clara de lo que entró, se transformó y salió.'
                  : location.pathname === '/catalogo'
                  ? 'Maestro de productos, materias primas y plantillas de rendimiento.'
                  : location.pathname === '/usuarios'
                  ? 'Gestión de usuarios, permisos y credenciales de acceso a planta.'
                  : 'Datos de los tres flujos de demostración.'}
              </p>
            </div>
            <div className="data-pill"><span className="status-dot"/> Escenario simulado</div>
          </div>

          <section className="control-strip" aria-label="Controles de demostración">
            <label className="control"><span>PERFIL</span><select value={profile} onChange={(e) => setProfile(e.target.value as Profile)}>{Object.entries(roles).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select><ChevronDown size={15}/></label>
            {profile === 'company-admin' && <label className="control"><span>EMPRESA ASIGNADA</span><select value={company} onChange={(e) => setCompany(e.target.value as CompanyId)}>{companies.filter((c) => c.id !== 'meet').map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><ChevronDown size={15}/></label>}
            <label className="control context-control"><span>CONTEXTO</span><select value={context} onChange={(e) => setContext(e.target.value as Context)}>{contexts.map((c) => <option key={c} value={c}>{names[c]}</option>)}</select><ChevronDown size={15}/></label>
            <label className="control"><span>ETAPA</span><select value={stage} onChange={(e) => setStage(e.target.value as typeof stage)}><option value="receipts">Recepciones</option><option value="production">Despostes</option><option value="completed">Flujos completos</option></select><ChevronDown size={15}/></label>
            <Button className="sync-button" onClick={simulateSync} disabled={syncing}><RefreshCcw size={17} className={syncing ? 'spinning' : ''}/>{syncing ? 'Actualizando…' : 'Simular actualización'}</Button>
          </section>

          <div className="sync-note">{syncedAt ? `Escenario actualizado en este navegador: ${new Date(syncedAt).toLocaleTimeString('es-ES')}` : 'Vista inicial del escenario. Pulsa “Simular actualización” para aplicar otra etapa.'} No hay conexión con el teléfono.</div>

          <Suspense fallback={<div className="empty-panel">Cargando reporte…</div>}>
            <Routes>
              <Route path="/" element={<Dashboard/>}/>
              <Route path="/produccion" element={<Produccion/>}/>
              <Route path="/inventario" element={<Inventario/>}/>
              <Route path="/trazabilidad" element={<Trazabilidad/>}/>
              <Route path="/rentabilidad" element={profile === 'warehouse-chief' ? <Navigate to="/" replace/> : <Rentabilidad/>}/>
              <Route path="/catalogo" element={<CatalogoPlantillas/>}/>
              <Route path="/usuarios" element={<Usuarios/>}/>
              <Route path="*" element={<Navigate to="/" replace/>}/>
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
