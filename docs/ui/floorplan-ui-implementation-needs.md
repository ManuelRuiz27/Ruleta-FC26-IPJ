# Necesidades UI/UX — Módulo Acomodo de Invitados / Croquis

Proyecto: **Invitaciones Digitales Premium**  
Módulo: **Organizer / Floorplan / Acomodo de invitados**  
Uso del documento: guía directa para Codex antes de ejecutar cambios visuales o de UX sobre el módulo.  
Estado objetivo: **UI premium operativa para wedding planners**.  

---

## 1. Objetivo del documento

Este documento concentra las decisiones congeladas para actualizar la UI del módulo de croquis desde Codex sin volver a discutir el alcance.

Codex debe usar este archivo como referencia para:

- corregir brechas visuales;
- mejorar la experiencia del planner;
- mantener consistencia de diseño;
- evitar convertir el módulo en una herramienta técnica tipo CAD;
- no romper lógica ya funcional de asignación, drag & drop, guardado y coordenadas.

Este documento complementa:

- `docs/floorplan-ux-redesign-roadmap.md`
- `docs/codex-ui-ux-pro-max-adapter.md`
- `apps/web-organizer/AGENTS.md`
- `docs/qa/floorplan-manual-qa.md` si existe
- `docs/qa/floorplan-visual-review.md` si existe

---

## 2. Decisión UX principal congelada

El módulo de croquis **no debe sentirse como AutoCAD, Figma, Canva ni editor gráfico técnico**.

Debe sentirse como una **estación de trabajo para acomodar invitados en mesas dentro de un salón**.

Jerarquía mental obligatoria:

```text
Personas → Mesas → Salón
```

No:

```text
Canvas → Figuras → Coordenadas
```

La planner entra para responder:

- ¿Cuántos invitados faltan por acomodar?
- ¿Cuántas personas caben?
- ¿Qué mesa tiene sobrecupo?
- ¿Dónde está la mesa de novios?
- ¿Quién está en cada mesa?
- ¿Qué falta resolver antes de activar el evento?

---

## 3. Estado funcional actual asumido

Antes de aplicar pulido visual, se asume que ya existe:

- `src/features/floorplan/`
- dashboard inicial `Acomodo de invitados`
- workspace `Modo organización`
- paleta de elementos
- panel contextual
- bottom metrics
- `PendingGuestsPanel`
- `ResolveIssuesPanel`
- drag & drop con `@dnd-kit/core`
- asignación con `PATCH guest.table_id`
- quitar invitado con `table_id: null`
- confirmación de sobrecupo
- mesa de novios modelada como `kind: "vip"` + `table_type: "main_couple"`
- coordenadas persistidas normalizadas

Si algo de lo anterior falla, Codex debe corregir el bug antes de hacer más pulido visual.

---

## 4. Frameworks y librerías congeladas

### 4.1 Ya usadas o permitidas

| Capa | Decisión | Uso esperado |
|---|---|---|
| UI base | React + TypeScript | Componentes del módulo |
| Canvas | React Konva / Konva | Croquis, mesas, zonas, selección, movimiento |
| Data fetching | TanStack Query | `floorplan`, `guests`, `tables`, invalidaciones |
| Estado local | Zustand o hooks/useReducer | Selección, modo de edición, feedback, modales |
| Drag & drop DOM | dnd-kit | Invitado pendiente → mesa |
| Íconos | Lucide React | Botones, acciones, estados |
| Estilos | CSS variables del módulo | Paleta premium y consistencia visual |

### 4.2 Permitidas para fases de pulido si aportan valor real

| Librería | Cuándo usarla |
|---|---|
| Radix Primitives / shadcn/ui | Dialogs, popovers, sheets, command/search, tooltips accesibles |
| Motion for React | Transiciones ligeras de paneles, feedback, cards; no animar cada mesa |
| React Hook Form + Zod | Formularios más complejos: editar mesa, matriz, filtros, configuración |
| dnd-kit sortable | Solo si se ordenan listas; no usar por ahora si no es necesario |

### 4.3 No instalar sin justificación

No agregar frameworks pesados de editor visual:

- React Flow
- Fabric.js si ya se usa Konva
- GrapesJS
- Craft.js
- Builder SDK
- editores drag-and-drop genéricos

El riesgo es convertir el módulo en un editor gráfico y perder foco operativo.

---

## 5. Estilo visual congelado

La UI debe sentirse:

- premium;
- editorial;
- calmada;
- clara;
- tablet-first;
- útil bajo presión operativa.

### 5.1 Paleta base

Usar variables del módulo, no colores sueltos en DOM:

```css
:root {
  --floor-bg: #f7f3ec;
  --floor-surface: #fffdf8;
  --floor-surface-soft: #f3ece0;
  --floor-surface-raised: #ffffff;
  --floor-border: rgba(97, 76, 50, 0.14);
  --floor-border-strong: rgba(176, 132, 55, 0.38);
  --floor-primary: #b8893a;
  --floor-primary-dark: #8b6427;
  --floor-text: #25211c;
  --floor-muted: #7e7568;
  --floor-danger: #c8564a;
  --floor-warning: #c8912e;
  --floor-success: #4f7f58;
}
```

### 5.2 Tipografía

- Títulos: serif elegante si está disponible en el proyecto; si no, usar jerarquía visual con font-weight alto y buen espaciado.
- UI: sans limpia, legible y sobria.
- Evitar tamaños pequeños en elementos críticos: planner debe operar rápido en tablet.

### 5.3 Lenguaje visual

- Botones primarios: acento gold/champagne.
- Acciones secundarias: superficie clara, borde sutil.
- Acciones destructivas: rojo sobrio, no alarmista.
- Sobrecupo: warning/danger moderado.
- Mesa seleccionada: borde evidente + sombra suave.
- Mesa de novios: visual distintivo pero elegante.
- Mesa vacía: discreta, no debe competir con alertas.

---

## 6. Pantallas congeladas

## 6.1 Dashboard inicial — `Acomodo de invitados`

Debe ser la entrada al módulo.

### Debe incluir

- Título: `Acomodo de invitados`.
- Estado: editable / solo consulta.
- CTA principal: `Editar acomodo`.
- CTA secundaria: `Ver pendientes`.
- CTA opcional: `Cargar plano base` / `Cambiar plano base`.
- Vista previa del salón.
- KPIs:
  - Capacidad total.
  - Asignados.
  - Sin mesa.
  - Sobrecupo.
- Card `Invitados sin mesa`.
- Card `Mesas principales`.
- Card `Resumen del salón`.
- Help card con lenguaje de producto.

### No debe incluir

- textos internos como `Sprint 3`, `roadmap`, `pendiente de implementar`;
- términos técnicos visibles;
- tabs viejos tipo `Preparar / Marcar / Revisar` como experiencia principal.

### Copy recomendado

```text
Organiza primero las mesas y después asigna invitados. Revisa capacidad, pendientes y sobrecupo antes de activar el evento.
```

---

## 6.2 Workspace fullscreen — `Modo organización`

Debe ser el espacio principal de trabajo.

### Layout obligatorio

```text
Topbar
├── Evento / Acomodo de invitados
├── Guardar
├── Deshacer
├── Rehacer
├── Ajustar vista
├── Bloquear fondo
└── Salir

Body
├── Panel izquierdo: invitados sin mesa + elementos del salón
├── Canvas central: croquis / mesas / zonas
└── Panel derecho: contexto dinámico

Bottom
└── KPIs operativos
```

### Reglas

- No debe ser solo un `fixed inset-0`.
- Debe parecer una estación de trabajo.
- Debe funcionar en desktop y tablet landscape.
- El panel contextual no debe desaparecer en tablet; puede colapsar o convertirse en drawer.

---

## 6.3 Panel izquierdo — Invitados + elementos

### Parte superior: Invitados sin mesa

Debe mostrar:

- cantidad de invitados pendientes;
- listado legible;
- drag hacia mesa;
- botón de asignación rápida a mesa seleccionada;
- acceso a `Ver pendientes`.

### Necesidad pendiente para eventos grandes

Si hay más de 12 invitados pendientes, se requiere al menos:

- buscador por nombre;
- o botón `Ver todos`;
- o paginación simple.

Esto es P1 antes de demo con eventos grandes.

### Parte inferior: Elementos del salón

Secciones:

**Mesas**

- Mesa redonda
- Mesa rectangular
- Mesa imperial
- Mesa herradura
- Mesa VIP
- Mesa de novios

**Zonas**

- Pista
- Barra
- Escenario / DJ
- Texto / Etiqueta
- Zona bloqueada

**Acciones**

- Matriz de mesas
- Ajustar vista
- Bloquear fondo

---

## 6.4 Canvas del salón

### Debe mostrar

- fondo/plano como referencia bloqueada;
- mesas con estado visual;
- zonas de apoyo;
- selección clara;
- sobrecupo sobrio;
- mesa de novios diferenciada;
- labels sin saturar.

### Estados visuales requeridos

- normal;
- seleccionada;
- hover;
- vacía;
- VIP;
- mesa de novios;
- sobrecupo;
- read-only.

### Reglas técnicas

- Persistencia: coordenadas normalizadas.
- Render: world coordinates.
- Pantalla: viewport transform.
- Conversión solo con helpers `toNormalized()` y `toWorld()`.
- No dividir/multiplicar coordenadas en componentes.

---

## 6.5 Panel derecho — contexto dinámico

### Sin selección

Debe mostrar:

- `¿Qué deseas hacer?`
- resumen: sin mesa, capacidad, asignados;
- acciones rápidas:
  - Agregar mesa;
  - Agregar Mesa de novios;
  - Agregar pista;
  - Abrir matriz.

### Mesa seleccionada

Debe mostrar:

- nombre de mesa;
- badge `Seleccionada`;
- capacidad;
- asignados;
- disponibles;
- forma;
- lista breve de invitados en mesa;
- acciones:
  - enfocar/asignar invitados;
  - convertir a VIP;
  - convertir a Mesa de novios;
  - duplicar;
  - eliminar.

### Mesa de novios seleccionada

Debe mostrar:

- título `Mesa de novios`;
- badge `Mesa principal`;
- capacidad 2;
- tipo VIP;
- forma rectangular;
- tratamiento visual especial;
- idealmente asientos simbólicos `Novia` / `Novio`.

### Zona seleccionada

Debe mostrar:

- nombre;
- tipo;
- editar nombre;
- cambiar tipo;
- duplicar;
- eliminar.

### Brecha actual conocida

Si existe botón `Asignar invitados` deshabilitado, debe corregirse:

- eliminarlo; o
- hacerlo útil enfocando `PendingGuestsPanel`; o
- abrir selector de invitados pendientes.

No debe quedar un botón muerto.

---

## 6.6 Resolver pendientes

### Objetivo

Convertir alertas en acciones.

### Debe mostrar

- invitados sin mesa;
- mesas con sobrecupo;
- mesas vacías;
- botón `Volver al editor`;
- click en mesa con sobrecupo → seleccionar mesa y volver al editor;
- click en invitado sin mesa → volver al editor y orientar la asignación.

### Brecha para demo fuerte

Debe evolucionar hacia:

- `Resolver ahora`;
- sugerencias de mesa con espacio;
- asignar desde el panel de pendientes;
- sugerir mover invitados desde mesas con sobrecupo;
- vista del croquis con problemas resaltados.

---

## 7. Mesa de novios

No crear nuevo `kind`.

Usar siempre:

```ts
kind: "vip"
table_type: "main_couple"
visual_shape: "rectangular"
label: "Mesa de novios"
capacity: 2
```

### Necesidades UX

- Debe poder crearse en máximo 2 clics.
- Debe verse diferente a una mesa VIP normal.
- Debe aparecer en `Mesas principales`.
- Debe tener badge `Mesa principal`.
- Debe tener tratamiento especial en canvas.

---

## 8. Read-only / evento activo

Cuando el evento está activo o el usuario no puede editar:

### Bloquear

- mover mesas;
- crear mesas;
- eliminar mesas;
- crear zonas;
- editar capacidad;
- asignar invitados;
- quitar invitados.

### Permitir

- consultar acomodo;
- abrir mesa;
- ver invitados;
- ver pendientes;
- revisar métricas.

No mostrar botones activos que no harán nada. Si están deshabilitados, deben explicar `Solo consulta` o `Evento activo`.

---

## 9. QA obligatorio antes de declarar listo

Crear o actualizar:

```text
docs/qa/floorplan-manual-qa.md
docs/qa/floorplan-visual-review.md
```

### Escenarios mínimos

1. Boda pequeña
   - 8 mesas;
   - mesa de novios;
   - pista/barra;
   - 60 invitados;
   - asignación por botón;
   - asignación por drag;
   - quitar invitado.

2. Evento mediano/grande
   - matriz de 50 mesas;
   - 500 invitados;
   - invitados sin mesa;
   - sobrecupo;
   - cancelar sobrecupo.

3. Read-only / active
   - no permite mover mesas;
   - no permite asignar/quitar;
   - sí permite consultar.

4. Persistencia
   - crear acomodo;
   - guardar;
   - recargar;
   - validar mesas, zonas, invitados y métricas.

5. Tablet landscape
   - canvas usable;
   - panel contextual accesible;
   - drag funcional;
   - métricas visibles.

6. Performance
   - 50 mesas;
   - 100 mesas;
   - 200 mesas si aplica.

---

## 10. Backend requerido para robustez

### Ya requerido/cumplido

- `GET /events/:event_id/tables` debe permitir lectura aunque evento esté activo.
- `POST /events/:event_id/tables/bulk` debe aceptar `table_type`, `visual_shape`, `width`, `height`.

### Pendiente recomendado

#### 10.1 Crear mesa individual consistente

`POST /events/:event_id/tables` debería:

- crear en `tables`;
- agregar entrada en `floorplans.layout_json.tables`;
- incrementar `floorplans.version`;
- auditar.

Si no se implementa, documentar que el frontend es responsable de guardar layout después de crear mesa individual.

#### 10.2 Endpoint preflight

Recomendado:

```http
GET /events/{eventId}/floorplan/preflight
```

Respuesta esperada:

```json
{
  "capacity_total": 180,
  "assigned_total": 142,
  "without_table": 18,
  "overflow_tables": 2,
  "empty_tables": 1,
  "can_activate": false
}
```

#### 10.3 Auditoría

Auditar:

- creación de mesa;
- edición;
- movimiento;
- eliminación;
- asignar invitado;
- quitar invitado;
- sobrecupo aceptado.

---

## 11. Anti-patrones prohibidos

- No volver a inflar `TablesPage.tsx`.
- No convertir `FloorplanDashboard.tsx` en un archivo cada vez más grande si se puede extraer a componentes/hooks.
- No meter asiento exacto todavía.
- No introducir IA/reconocimiento avanzado antes de QA.
- No mostrar copy interno de sprints.
- No usar términos técnicos visibles.
- No guardar visuales en `localStorage`.
- No mezclar pixeles con coordenadas normalizadas.
- No usar `window.alert`, `window.confirm`, `window.prompt` en flujos finales.
- No instalar dependencias grandes sin justificar.

---

## 12. Brechas prioritarias actuales

### P0 — Antes de demo

1. Eliminar cualquier copy interno de Sprint o roadmap visible al usuario.
2. Crear QA formal en `docs/qa/`.
3. Ejecutar prueba real de guardar/recargar.
4. Validar tablet landscape.
5. Confirmar que no existen botones muertos en panel contextual.

### P1 — Antes de producción interna

1. Agregar búsqueda o `Ver todos` a `PendingGuestsPanel`.
2. Mejorar `ResolveIssuesPanel` con acciones más directas.
3. Agregar seguridad para quitar invitado: confirmación o undo.
4. Centralizar tema de canvas.
5. Extraer lógica de asignación a `useGuestTableAssignment` si el archivo crece más.

### P2 — Fase posterior

1. Endpoint preflight.
2. Auditoría completa.
3. Mesa por asiento.
4. Sugerencias automáticas avanzadas.
5. IA/reconocimiento de croquis más robusto.

---

## 13. Instrucciones para Codex

Cuando se use este documento, Codex debe recibir tareas pequeñas.

No usar prompts amplios como:

```text
Implementa todo el documento.
```

Usar microtareas:

```text
Corrige solo el copy interno del overview.
```

```text
Agrega búsqueda simple a PendingGuestsPanel.
```

```text
Crea docs/qa/floorplan-manual-qa.md sin tocar frontend.
```

```text
Reemplaza el botón muerto Asignar invitados por acción que enfoque pendientes.
```

### Prompt base recomendado

```md
Trabaja solo en floorplan.
Contexto: docs/ui/floorplan-ui-implementation-needs.md y apps/web-organizer/AGENTS.md.

Objetivo único:
[describir una sola tarea]

Archivos permitidos:
[listar máximo 2-4 archivos]

Restricciones:
- No tocar backend salvo que se indique.
- No asiento exacto.
- No agregar features no solicitadas.
- Mantener lint/build OK.

Ejecuta:
pnpm -C apps/web-organizer lint
pnpm -C apps/web-organizer build

Reporta solo:
- archivos modificados
- lint/build OK o error exacto
```

---

## 14. Criterio de aceptación final

Una planner debe poder entender en menos de 10 segundos:

- cuántos invitados faltan por acomodar;
- cuál es la capacidad total;
- qué mesa está seleccionada;
- si hay sobrecupo;
- cómo asignar invitados;
- cómo quitar invitados;
- cómo resolver pendientes;
- cómo salir sin perder control.

Si la UI obliga a pensar en coordenadas, capas o herramientas técnicas, el diseño falló.
