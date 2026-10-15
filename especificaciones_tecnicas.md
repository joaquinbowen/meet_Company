# Especificaciones Técnicas: Prototipo Web Administrativo (React)

## 1. Stack Tecnológico
- **Framework Core:** React (utilizando Vite para un entorno ligero o Next.js si se prefiere App Router).
- **Lenguaje:** TypeScript (Interfaces compartidas con la app móvil).
- **Estilos y Componentes:** Tailwind CSS + Shadcn/ui (para tablas, modales, selectores y tarjetas con aspecto corporativo y profesional).
- **Gráficos:** Recharts (librería optimizada para React para construir los dashboards de rendimiento y rentabilidad).
- **Estado Global:** `zustand` (Para manejar el "Tenant" seleccionado y los datos simulados).
- **Ruteo:** React Router (si se usa Vite) o Next Router.

## 2. Lógica de Datos Simulados (Mock Data Architecture)
Al ser un prototipo sin base de datos, la web consumirá un archivo estático masivo (`mockDatabase.ts`) que simulará ser el resultado de la sincronización de la app móvil.
- El estado global (`useAdminStore`) cargará estos datos simulados y expondrá "Selectores" (Getters) que calculen la información al vuelo.
- **Ejemplo de Selector:** `getInventario(empresaId: string | 'CONSOLIDADO')` iterará sobre el array de lotes y sumará kilos y costos dependiendo del filtro.

## 3. Estructura de Carpetas Propuesta

```text
/src
  /assets              # Logos, íconos
  /components
    /layout            # Sidebar, Topbar, Selector de Empresa
    /ui                # Componentes Shadcn (Botones, Tablas, Tarjetas)
    /charts            # Componentes wrapper de Recharts (PieChart, BarChart)
  /pages
    Dashboard.tsx      # KPIs principales
    Produccion.tsx     # Reportes de mermas y rendimientos
    Inventario.tsx     # Valorización y stock
    Trazabilidad.tsx   # Buscador y Timeline visual del lote
    Rentabilidad.tsx   # Tabla de márgenes
  /store
    useAdminStore.ts   # Manejo de estado, filtros y datos quemados
  /utils
    formatters.ts      # Formato de moneda ($), porcentajes (%) y pesos (kg)
    aggregators.ts     # Funciones pesadas: sumar mermas, calcular márgenes
  /mocks
    dbMocks.ts         # JSON grande con el historial de compras, procesos y ventas simuladas

```

## 4. Requisitos de UI / UX para el Backoffice
Layout Fijo: Barra lateral izquierda (Sidebar) para navegación y barra superior (Topbar) para el perfil de usuario y el Selector de Contexto (Empresa).

Data Tables Avanzadas: Las tablas (como la de inventario o procesos) deben incluir inputs de búsqueda, ordenamiento por columnas (ej. ordenar por "Mayor Merma") y paginación simulada.

Exportación Simulada: Botones de "Exportar a Excel" o "Imprimir Reporte" en las vistas de tablas (pueden descargar un CSV básico generado desde el array simulado o solo mostrar un toast de éxito para el demo).

Indicador de Sincronización: Un icono en la barra superior que indique "Última sincronización con Cuartos Fríos: Hace 5 min", para dar contexto de cómo se integra con el prototipo móvil.

## 5. Algoritmos de Cálculo en el Frontend (Para el Demo)
Para que los reportes funcionen en el prototipo, se deben implementar funciones puras en aggregators.ts:

Consolidado de Merma: suma(kilos_merma) / suma(kilos_procesados_padre) * 100

Valorización de Inventario: Iterar lotes_activos de una empresa y multiplicar peso_disponible * costo_por_kilo.

Margen de Ganancia: Por cada venta, buscar el lote_origen, obtener su costo_por_kilo, calcular costo_total_venta y restarlo del ingreso_venta.
