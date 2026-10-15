import { useState } from 'react';
import {
  Users,
  ShieldCheck,
  Smartphone,
  KeyRound,
  PlusCircle,
  CheckCircle2,
  Search,
  Filter,
  Eye,
  EyeOff,
  X,
  UserCheck,
  Building2,
  Lock,
} from 'lucide-react';
import { companies, type CompanyId } from '@meetcompany/demo-domain';
import { useAdminStore } from '../store/useAdminStore';
import { useUserStore, type UserItem, type UserRole } from '../store/useUserStore';

const roleLabels: Record<UserRole, { label: string; desc: string; bg: string; color: string }> = {
  management: {
    label: 'Gerencia General',
    desc: 'Visibilidad total y creación de administradores / jefes',
    bg: '#FBE7DC',
    color: '#843315',
  },
  'company-admin': {
    label: 'Admin. de Empresa',
    desc: 'Gestión comercial e inventario de su empresa asignada',
    bg: '#E0E7FF',
    color: '#3730A3',
  },
  'warehouse-chief': {
    label: 'Jefe de Almacén',
    desc: 'Control físico de planta y creación de operadores de app con PIN',
    bg: '#FEF3C7',
    color: '#92400E',
  },
  'app-operator': {
    label: 'Operador de Planta (App)',
    desc: 'Operación directa en móvil (recepción, desposte, despacho)',
    bg: '#DCFCE7',
    color: '#166534',
  },
};

export function Usuarios() {
  const { profile, company } = useAdminStore();
  const { users, addUser, toggleUserStatus } = useUserStore();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showPins, setShowPins] = useState<Record<string, boolean>>({});

  // Formulario nuevo usuario
  const isManagement = profile === 'management';
  const isWarehouseChief = profile === 'warehouse-chief';

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<UserRole>(isWarehouseChief ? 'app-operator' : 'company-admin');
  const [formCompany, setFormCompany] = useState<CompanyId>(company || 'meet');
  const [formPin, setFormPin] = useState('');

  // Filtrado según permisos del perfil activo
  const visibleUsers = users.filter((u) => {
    if (profile === 'company-admin') {
      return u.companyId === company;
    }
    return true;
  });

  const filteredUsers = visibleUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const togglePin = (userId: string) => {
    setShowPins((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleOpenModal = () => {
    if (isWarehouseChief) {
      setFormRole('app-operator');
      setFormPin(Math.floor(1000 + Math.random() * 9000).toString());
    } else {
      setFormRole('company-admin');
      setFormPin('');
    }
    setFormName('');
    setFormEmail('');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    if (formRole === 'app-operator' && (!formPin || formPin.length !== 4)) {
      alert('El PIN para operador de app móvil debe ser exactamente de 4 dígitos numéricos.');
      return;
    }

    const creatorName =
      profile === 'management'
        ? 'Celedonio Heredia (Gerencia)'
        : profile === 'warehouse-chief'
        ? 'Jorge Alarcón (Jefe de Almacén)'
        : 'Administrador de Empresa';

    addUser({
      name: formName.trim(),
      email: formEmail.trim(),
      role: formRole,
      companyId: formCompany,
      pin: formRole === 'app-operator' ? formPin : undefined,
      active: true,
      createdBy: creatorName,
    });

    setShowModal(false);
  };

  return (
    <div className="usuarios-page">
      {/* Intro de la página */}
      <div className="report-intro">
        <div>
          <h2>Gestión de usuarios y accesos de planta</h2>
          <p>
            Administración de credenciales web y configuración de PIN de acceso rápido para operadores móviles.
          </p>
        </div>
        <div className="inline-stat-card">
          <small>Usuarios visibles</small>
          <strong>{filteredUsers.length} cuentas</strong>
        </div>
      </div>

      {/* Reglas de permisos y jerarquía */}
      <section
        style={{
          background: '#fff',
          border: '1px solid #E5DFD7',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '9px',
              background: '#FAF3ED',
              color: '#A9431E',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#242A2D' }}>
              Permiso de perfil activo: {profile === 'management' ? 'Gerencia General' : profile === 'warehouse-chief' ? 'Jefe de Almacén' : 'Administrador de Empresa'}
            </div>
            <div style={{ fontSize: '12px', color: '#746F6A' }}>
              {isManagement
                ? 'Como Gerente puedes crear Administradores de empresa y Jefes de almacén con alcance multiempresa.'
                : isWarehouseChief
                ? 'Como Jefe de almacén puedes dar de alta Operadores de la app móvil y configurar su PIN de 4 dígitos.'
                : 'Como Administrador puedes auditar las acciones y personal asignado a tu empresa.'}
            </div>
          </div>
        </div>

        {(isManagement || isWarehouseChief) && (
          <button
            onClick={handleOpenModal}
            style={{
              background: '#A9431E',
              color: '#fff',
              border: 'none',
              padding: '9px 18px',
              borderRadius: '7px',
              fontSize: '13px',
              fontWeight: 650,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <PlusCircle size={16} />
            {isWarehouseChief ? 'Crear Operador de App (con PIN)' : 'Crear Usuario Administrativo'}
          </button>
        )}
      </section>

      {/* Tarjetas resumen de cuentas */}
      <section className="metric-ribbon" style={{ marginBottom: '20px' }}>
        <div className="metric-primary">
          <span>OPERADORES DE APP (MÓVIL)</span>
          <strong>{users.filter((u) => u.role === 'app-operator').length}</strong>
          <small>Con PIN para ingreso rápido en planta</small>
        </div>
        <div>
          <span>JEFES DE ALMACÉN</span>
          <strong>{users.filter((u) => u.role === 'warehouse-chief').length}</strong>
          <small>Responsables de planta física</small>
        </div>
        <div>
          <span>ADMINISTRADORES</span>
          <strong>{users.filter((u) => u.role === 'company-admin').length}</strong>
          <small>Rodrigo, Quality y Meet Company</small>
        </div>
        <div>
          <span>TOTAL DE CUENTAS</span>
          <strong>{users.length}</strong>
          <small>Activas en el sistema</small>
        </div>
      </section>

      {/* Tabla de usuarios */}
      <div className="table-panel">
        <div className="table-tools">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label style={{ fontSize: '11px', color: '#746F6A', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} /> Rol:
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{ border: '1px solid #E7DED5', borderRadius: '6px', padding: '4px 8px', fontSize: '12px' }}
              >
                <option value="all">Todos los roles</option>
                <option value="app-operator">Operadores de planta</option>
                <option value="warehouse-chief">Jefes de almacén</option>
                <option value="company-admin">Administradores de empresa</option>
                <option value="management">Gerencia</option>
              </select>
            </label>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th><button type="button">Usuario</button></th>
                <th><button type="button">Rol en Sistema</button></th>
                <th><button type="button">Empresa Asignada</button></th>
                <th><button type="button">Acceso Móvil / PIN</button></th>
                <th><button type="button">Creado Por</button></th>
                <th><button type="button">Fecha Alta</button></th>
                <th><button type="button">Estado</button></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const roleConfig = roleLabels[u.role];
                const companyObj = companies.find((c) => c.id === u.companyId);

                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            background: '#F0ECE6',
                            color: '#343B3E',
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: '11px',
                            fontWeight: 700,
                          }}
                        >
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <strong>{u.name}</strong>
                          <div style={{ fontSize: '11px', color: '#817B75' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: roleConfig.bg,
                          color: roleConfig.color,
                        }}
                      >
                        {roleConfig.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                        <Building2 size={13} color="#746F6A" />
                        <span>{companyObj?.name || u.companyId}</span>
                      </div>
                    </td>
                    <td>
                      {u.pin ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontSize: '13px',
                              letterSpacing: '0.15em',
                              background: '#F5EDE5',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontWeight: 700,
                              color: '#843315',
                            }}
                          >
                            {showPins[u.id] ? u.pin : '••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePin(u.id)}
                            style={{ background: 'transparent', border: 'none', color: '#746F6A', cursor: 'pointer', padding: 0 }}
                            title={showPins[u.id] ? 'Ocultar PIN' : 'Ver PIN'}
                          >
                            {showPins[u.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#BBB4AC' }}>Solo acceso web</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '11px', color: '#746F6A' }}>{u.createdBy}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '11px', color: '#746F6A' }}>{u.createdAt}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => toggleUserStatus(u.id)}
                        style={{
                          border: 'none',
                          background: u.active ? '#E7F2E6' : '#FEE4D7',
                          color: u.active ? '#2F6B45' : '#843315',
                          padding: '3px 9px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {u.active ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>
            Mostrando {filteredUsers.length} de {users.length} usuarios registrados
          </span>
          <div>
            <span style={{ fontSize: '11px', color: '#746F6A' }}>
              Operadores vinculados a la app móvil con PIN directo
            </span>
          </div>
        </div>
      </div>

      {/* MODAL: CREACIÓN DE USUARIO CON REGLAS DE JERARQUÍA */}
      {showModal && (
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
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '14px',
              maxWidth: '540px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
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
                    background: '#FAF3ED',
                    color: '#A9431E',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  {formRole === 'app-operator' ? <Smartphone size={20} /> : <Users size={20} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#242A2D' }}>
                    {isWarehouseChief ? 'Alta de Operador de Planta (App)' : 'Alta de Usuario Administrativo'}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#746F6A' }}>
                    {isWarehouseChief
                      ? 'Asigna credenciales y un PIN de 4 dígitos para ingreso en la app móvil.'
                      : 'El Gerente asigna Administradores de empresa y Jefes de almacén.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#746F6A', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 650, color: '#746F6A', marginBottom: '4px' }}>
                    Nombre Completo:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #E7DED5', borderRadius: '6px', fontSize: '12px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 650, color: '#746F6A', marginBottom: '4px' }}>
                    Correo Electrónico / Identificador:
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="usuario@meetcompany.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #E7DED5', borderRadius: '6px', fontSize: '12px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 650, color: '#746F6A', marginBottom: '4px' }}>
                    Rol Asignado:
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #E7DED5', borderRadius: '6px', fontSize: '12px' }}
                  >
                    {isManagement && (
                      <>
                        <option value="company-admin">Administrador de empresa</option>
                        <option value="warehouse-chief">Jefe de almacén</option>
                      </>
                    )}
                    {isWarehouseChief && (
                      <option value="app-operator">Operador de planta (App Móvil)</option>
                    )}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 650, color: '#746F6A', marginBottom: '4px' }}>
                    Empresa Asignada:
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

                {/* Campo obligatorio de PIN para Operadores de App */}
                {formRole === 'app-operator' && (
                  <div
                    style={{
                      background: '#FAF8F5',
                      border: '1px solid #EDE7DF',
                      borderRadius: '8px',
                      padding: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <KeyRound size={14} color="#A9431E" />
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#A9431E' }}>
                        PIN de 4 dígitos para ingreso en App Móvil:
                      </label>
                    </div>
                    <input
                      type="text"
                      maxLength={4}
                      pattern="[0-9]{4}"
                      required
                      placeholder="1234"
                      value={formPin}
                      onChange={(e) => setFormPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      style={{
                        width: '120px',
                        padding: '8px 10px',
                        border: '1px solid #E7DED5',
                        borderRadius: '6px',
                        fontSize: '16px',
                        fontWeight: 700,
                        letterSpacing: '0.2em',
                        textAlign: 'center',
                        fontFamily: 'monospace',
                      }}
                    />
                    <div style={{ fontSize: '11px', color: '#746F6A', marginTop: '6px' }}>
                      Este PIN le permite al operario desbloquear la terminal de planta y firmar sus despachos y despostes.
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #F0ECE6', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="subtle-button"
                  style={{ color: '#746F6A', border: '1px solid #D6CEC5' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#A9431E',
                    color: '#fff',
                    border: 'none',
                    padding: '9px 20px',
                    borderRadius: '7px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <CheckCircle2 size={16} /> Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
