# Web administrativa · Meet Company

Panel frontend de demostración para el Grupo Rodrigo. Usa los mismos contratos, productos y tres escenarios que `mobile/`, mediante `packages/demo-domain`. No usa backend ni base de datos remota.

## Arranque con pnpm

Desde la raíz del proyecto:

```sh
pnpm install
pnpm --dir web dev
```

Para compilar:

```sh
pnpm --dir web build
```

## Recorrido

1. Abrir el panel general en vista Consolidado: 560 kg disponibles, 600 kg procesados y 70 kg de merma tras los flujos completos.
2. Cambiar la etapa a Recepciones y pulsar **Simular actualización**: 750 kg de materia prima/producto terminado.
3. Cambiar a Despostes y actualizar: 680 kg disponibles.
4. Cambiar a Flujos completos y actualizar: 560 kg disponibles y 120 kg despachados.
5. Revisar Producción, Inventario, Trazabilidad y Rentabilidad. Los filtros, orden y CSV operan sobre el escenario visible.
6. Cambiar entre Gerencia, Administrador de empresa y Jefe de almacén para ver sus alcances. Son perfiles de presentación, no control de acceso de servidor.

El selector **Meet Company · propietaria** muestra su inventario lógico vacío. **Almacén físico · Meet Company** muestra todos los lotes almacenados físicamente allí.

La actualización es simulada y local al navegador. El estado guardado por la app móvil en otro dispositivo no aparece automáticamente en la web. Los datos originales no incluyen precios de venta; por eso ingreso y margen se muestran como no calculables. La valorización reparte el costo de compra entre los kilos útiles resultantes del desposte.

## Estado técnico

La interfaz usa Tailwind CSS para utilidades, un componente Button siguiendo el patrón de Shadcn/ui y CSS propio para el layout y la identidad visual de planta. La revisión visual en navegador queda pendiente porque el navegador integrado no pudo abrir la vista local en esta sesión.

