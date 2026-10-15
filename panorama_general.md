# Panorama General: Plataforma Web Administrativa y de Reportes (Grupo Rodrigo)

## 1. Propósito del Sistema
Desarrollar un prototipo de la aplicación web de "Backoffice" (Panel de Administración) para el Grupo Rodrigo. Mientras que la app móvil captura los datos en el cuarto frío (offline), esta plataforma web centraliza la información sincronizada para auditar flujos, calcular costos, mantener la trazabilidad completa y generar reportes tanto individuales (por empresa) como consolidados (del grupo).

## 2. Usuarios y Roles
- **Gerencia (ej. Celedonio Huamán):** Acceso total a vistas consolidadas, rentabilidad global y comparativas entre empresas.
- **Administrador de Empresa:** Acceso restringido únicamente a los reportes, inventario y costos de su empresa (Rodrigo, Quality o Finilong).
- **Jefe de Almacén (Meet Company):** Vista enfocada en el volumen físico total, sin importar la empresa propietaria.

## 3. Módulos Principales del Prototipo Web

### A. Dashboard General (Panel de Control)
- **Selector de Contexto:** Un menú desplegable superior global para cambiar la vista entre "Consolidado Grupo Rodrigo", "Meet Company", "Rodrigo", "Quality" o "Finilong".
- **KPIs (Indicadores Clave):** Total de kilos procesados hoy, valor del inventario actual, porcentaje promedio de merma.
- **Gráficos:** Gráfico circular de distribución de inventario por empresa (solo en vista consolidada) y gráfico de barras de rendimiento.

### B. Módulo de Reportes de Producción (Desposte)
- **Listado de Procesos:** Tabla con el historial de todos los despostes realizados por la app móvil.
- **Métricas por Proceso:**
  - Kilos procesados vs. Kilos obtenidos.
  - Merma (kilos y %).
  - Rendimiento (%).
- **Filtros:** Por fecha, por lote y por empresa.

### C. Módulo de Inventario y Valorización (Costeo)
- **Inventario Lógico (Por Empresa):** Muestra el stock disponible de la empresa seleccionada y el costo total de esa mercadería.
- **Inventario Físico (Meet Company):** Sumatoria de todos los lotes de todas las empresas que se encuentran físicamente en la bodega.
- **Asignación de Costos:** Visor de cómo el costo de un lote de materia prima (ej. 400kg a $1200) se prorrateó entre los cortes resultantes.

### D. Módulo de Trazabilidad End-to-End
- **Buscador de Lotes:** Un input donde se ingresa el código de un lote (ej. lote de venta o lote de compra).
- **Línea de Tiempo Visual (Timeline):** Muestra el ciclo de vida del producto:
  `Compra (Proveedor X) -> Ingreso Almacén Meet -> Desposte (Merma Y%) -> Lotes Resultantes -> Venta (Cliente Z)`.

### E. Módulo de Rentabilidad (Ventas vs Costos)
- Tabla analítica que cruza los despachos (salidas) con sus costos asociados.
- Columnas clave: Empresa Vendedora, Producto, Precio de Venta (variable por cliente), Costo Real del Lote, Margen ($) y Ganancia (%).