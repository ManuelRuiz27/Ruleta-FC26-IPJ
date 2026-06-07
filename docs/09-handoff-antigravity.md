# 09 — Handoff para Antigravity

## Proyecto

**Mundial FC 26 — Plataforma de Sorteo y Seguimiento**

## Propósito

Este documento entrega el contexto operativo y técnico mínimo para que el agente de desarrollo en **Google Antigravity** implemente la plataforma sin desviarse del alcance definido.

El agente debe usar este archivo como guía de ejecución y debe consultar los documentos previos antes de modificar o generar código.

---

## 1. Documentos base obligatorios

Antes de implementar, leer en este orden:

1. `00-resumen-ejecutivo.md`
2. `01-alcance-mvp.md`
3. `02-reglas-del-torneo.md`
4. `03-requerimientos-funcionales.md`
5. `04-flujos-operativos.md`
6. `05-modelo-de-datos.md`
7. `06-ui-ux.md`
8. `07-plan-de-pruebas.md`
9. `08-deployment.md`
10. `09-handoff-antigravity.md`

Si un documento contradice la convocatoria oficial, prevalece la convocatoria oficial.

---

## 2. Alcance que debe implementar el agente

El sistema no es solo una ruleta. Es una plataforma ligera para operar el torneo completo.

Debe cubrir:

- Catálogo de regiones y municipios participantes.
- Registro de participantes por municipio.
- Sorteo visual de selecciones mediante ruleta.
- Asignación única de selección dentro de cada municipio.
- Dashboard municipal.
- Generación de bracket de eliminación directa.
- Captura de marcador final por partido.
- Avance automático de ganadores.
- Detección de campeón y subcampeón municipal.
- Consolidación de clasificados regionales.
- Resolución de duplicidad de selecciones.
- Bracket regional.
- Final estatal.
- Dashboard estatal.
- Exportación CSV y JSON.

---

## 3. Fuera de alcance

No implementar en MVP:

- Marcador en vivo.
- Cronómetro de partido.
- Estadísticas avanzadas.
- Streaming.
- App móvil nativa.
- Chat.
- Panel financiero.
- Gestión compleja de permisos.
- Carga de imágenes pesadas.
- Historial multi-anual.
- Backend propio en Node, Laravel o NestJS.

Si el agente propone cualquiera de estos puntos, debe descartarlo salvo instrucción explícita del owner del proyecto.

---

## 4. Stack autorizado

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- Framer Motion
- Zustand

### Backend/BaaS

- Supabase
  - PostgreSQL
  - Auth
  - Realtime
  - Row Level Security

### Hosting

- Cloudflare Pages para frontend.
- Supabase Free Tier para datos y auth.

---

## 5. Principio de implementación

El desarrollo debe ser incremental.

No generar una arquitectura innecesariamente grande. No crear capas abstractas si todavía no aportan valor.

Prioridad:

1. Correctitud del flujo operativo.
2. Persistencia de datos.
3. Claridad visual.
4. Validaciones.
5. Realtime.
6. Estética final.

---

## 6. Orden recomendado de implementación

### Fase 1 — Base del proyecto

Crear proyecto React + Vite + TypeScript.

Instalar:

```bash
npm install
npm install @supabase/supabase-js zustand framer-motion
npm install -D tailwindcss postcss autoprefixer
```

Configurar:

- Tailwind.
- Variables de entorno.
- Cliente Supabase.
- Estructura de carpetas.
- Rutas principales.

Estructura sugerida:

```txt
src/
  app/
  components/
  features/
    setup/
    draw/
    bracket/
    dashboard/
    regional/
    state-final/
  lib/
    supabase/
    utils/
  store/
  types/
  data/
  styles/
```

---

### Fase 2 — Catálogos base

Implementar catálogos iniciales:

- Regiones.
- Municipios.
- Selecciones.

Los catálogos pueden iniciar como seed local y después migrarse a Supabase.

Archivos sugeridos:

```txt
src/data/regions.ts
src/data/municipalities.ts
src/data/teams.ts
```

Validaciones:

- Cada municipio debe pertenecer a una región.
- Deben existir 32 selecciones activas.
- No debe haber IDs duplicados.

---

### Fase 3 — Registro municipal

Implementar pantalla de configuración municipal.

Debe permitir:

- Seleccionar municipio.
- Ver región asociada.
- Registrar participantes.
- Validar mínimo 8 y máximo 32.
- Bloquear inicio si hay nombres vacíos o duplicados.

Estado esperado:

```txt
draft → ready_for_draw
```

---

### Fase 4 — Sorteo de selecciones

Implementar ruleta visual.

Reglas obligatorias:

- El resultado se calcula antes de animar.
- La ruleta debe girar mínimo 1.5 vueltas.
- El botón se bloquea durante la animación.
- Una selección no puede repetirse dentro de la misma sesión municipal.
- Cada asignación se guarda inmediatamente.

Estado esperado:

```txt
ready_for_draw → drawing → draw_completed
```

Pantallas:

- Ruleta pública.
- Tabla de participantes.
- Selección asignada.
- Progreso del sorteo.

---

### Fase 5 — Dashboard municipal

Implementar vista municipal.

Debe mostrar:

- Municipio.
- Región.
- Estado de eliminatoria.
- Participantes registrados.
- Selecciones asignadas.
- Progreso del sorteo.
- Estado del bracket.
- Campeón y subcampeón cuando existan.

---

### Fase 6 — Bracket municipal

Implementar generación de bracket de eliminación directa.

Reglas:

- Soportar 8 a 32 participantes.
- Si no es potencia de 2, generar byes.
- El ganador avanza automáticamente.
- La final define campeón y subcampeón.

No implementar fase de grupos.

---

### Fase 7 — Captura de marcador

Implementar captura de marcador final.

Campos:

- Score jugador A.
- Score jugador B.
- Indicador de tiempos extra.
- Indicador de penales.
- Score de penales, si aplica.
- Ganador.

Validaciones:

- No permitir marcador negativo.
- No cerrar partido empatado sin definición.
- No permitir penales empatados.
- No permitir ganador ajeno al partido.

---

### Fase 8 — Regionales

Implementar consolidación regional.

Debe mostrar por región:

- Municipios participantes.
- Estado de cada municipio.
- Campeón municipal.
- Subcampeón municipal.
- Selección de cada clasificado.
- Duplicidades de selección.

No permitir iniciar bracket regional si hay duplicidades pendientes.

---

### Fase 9 — Resolución de duplicidades

Implementar módulo de desempate de selección.

Regla:

1. Campeón conserva sobre subcampeón.
2. Si ambos tienen mismo rango, sorteo público para conservar.
3. El jugador afectado gira ruleta secundaria.
4. La selección nueva no puede estar bloqueada.
5. La reasignación queda auditada.

---

### Fase 10 — Final estatal

Implementar consolidación de campeones y subcampeones regionales.

Debe permitir:

- Ver finalistas estatales.
- Resolver duplicidades estatales.
- Generar bracket estatal.
- Capturar marcadores.
- Definir campeón estatal.
- Cerrar torneo.

---

## 7. Reglas que no deben romperse

- Mínimo 8 jugadores por eliminatoria municipal.
- Máximo 32 jugadores por eliminatoria municipal.
- Una selección no se repite dentro del mismo municipio.
- El torneo es eliminación directa.
- Campeón y subcampeón municipal avanzan a regional.
- Campeón y subcampeón regional avanzan a final estatal.
- Un partido cerrado debe tener ganador.
- Si hay empate, debe resolverse por tiempo extra o penales.
- No debe cerrarse una fase con datos pendientes o inconsistentes.

---

## 8. Criterios de UI/UX

Basarse en `06-ui-ux.md`.

Principios:

- Estética dark blueprint.
- Fondo oscuro.
- Bordes finos.
- Glow azul moderado.
- Botón primario único por pantalla crítica.
- Banderas como principal elemento de color.
- Pantalla de ruleta optimizada para proyector.
- Dashboards administrativos claros, no decorativos.

No usar:

- Gradientes saturados innecesarios.
- Cards multicolor.
- Sombras pesadas.
- Efectos que dificulten lectura.
- Animaciones largas.

---

## 9. Variables de entorno

Crear archivo `.env.example`:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

No guardar claves reales en el repositorio.

---

## 10. Supabase

El agente debe crear scripts SQL o migraciones para:

- regions
- municipalities
- teams
- users/profile mínimo si aplica
- draw_sessions
- participants
- assignments
- brackets
- matches
- qualified_players
- team_reassignments
- audit_logs

Debe aplicar restricciones únicas donde corresponda.

Restricciones críticas:

- Una selección no se repite por sesión municipal.
- Un participante no puede tener más de una selección por sesión.
- Un partido cerrado requiere ganador.
- Un municipio no debe tener dos sesiones municipales activas.

---

## 11. Realtime

Realtime se debe usar con moderación.

Aplicar realtime a:

- Dashboard estatal.
- Dashboard regional.
- Dashboard municipal.
- Actualización de asignaciones.
- Actualización de partidos completados.

No aplicar realtime a:

- Animaciones internas de ruleta.
- Cada frame visual.
- Eventos irrelevantes de UI.

---

## 12. Exportaciones

Implementar exportación local en:

- CSV.
- JSON.

Exportaciones mínimas:

- Resultado municipal.
- Clasificados municipales.
- Resultado regional.
- Finalistas estatales.
- Resultado final estatal.

---

## 13. Testing obligatorio

Antes de cerrar implementación, validar:

- Municipio con 8 participantes.
- Municipio con 32 participantes.
- Municipio con 12, 16, 24 y 30 participantes.
- Bracket con byes.
- Partido empatado con penales.
- Final municipal genera campeón y subcampeón.
- Duplicidad regional entre dos campeones.
- Duplicidad regional entre campeón y subcampeón.
- Reasignación de selección.
- Exportación CSV y JSON.
- Recarga de página sin pérdida de estado.

---

## 14. Instrucciones para Antigravity

El agente debe trabajar por pasos pequeños.

En cada iteración:

1. Leer el documento aplicable.
2. Identificar el módulo a modificar.
3. Implementar solo el módulo solicitado.
4. Ejecutar pruebas o validaciones disponibles.
5. Reportar archivos modificados.
6. Reportar riesgos o inconsistencias detectadas.

No debe:

- Reescribir toda la app sin necesidad.
- Cambiar el stack sin autorización.
- Agregar features fuera del MVP.
- Ignorar reglas de torneo.
- Generar abstracciones grandes antes de validar el flujo.
- Meter backend propio.
- Meter dependencias pesadas para resolver problemas simples.

---

## 15. Prompt base para iniciar en Antigravity

```txt
Actúa como agente de desarrollo para el proyecto Mundial FC 26 — Plataforma de Sorteo y Seguimiento.

Antes de escribir código, lee los documentos en /docs, especialmente:

- 01-alcance-mvp.md
- 02-reglas-del-torneo.md
- 03-requerimientos-funcionales.md
- 04-flujos-operativos.md
- 05-modelo-de-datos.md
- 06-ui-ux.md
- 07-plan-de-pruebas.md
- 09-handoff-antigravity.md

Implementa el sistema de forma incremental con React + Vite + TypeScript + Tailwind + Zustand + Supabase.

No implementes backend propio.
No agregues features fuera del MVP.
No cambies reglas del torneo.

Primera tarea:
1. Crear estructura base del proyecto.
2. Configurar Tailwind.
3. Configurar cliente Supabase.
4. Crear rutas principales.
5. Crear catálogos iniciales de regiones, municipios y selecciones.
6. Entregar resumen de archivos creados y próximos pasos.
```

---

## 16. Prompt para desarrollo del módulo de ruleta

```txt
Implementa el módulo de sorteo de selecciones.

Requisitos:

- Usar participantes ya registrados.
- Aleatorizar orden antes de iniciar sorteo.
- Calcular selección antes de animar.
- Animar ruleta con mínimo 1.5 vueltas.
- Bloquear botón mientras gira.
- Guardar asignación en Supabase.
- Evitar selecciones repetidas dentro de la misma sesión.
- Actualizar tablero de participantes.
- Mantener diseño basado en 06-ui-ux.md.

No implementes bracket todavía.
```

---

## 17. Prompt para desarrollo del bracket

```txt
Implementa el módulo de bracket municipal.

Requisitos:

- Generar bracket después de terminar sorteo.
- Soportar 8 a 32 participantes.
- Generar byes si el número no es potencia de 2.
- Capturar marcador final por partido.
- Validar empate con tiempos extra y penales.
- Avanzar ganador automáticamente.
- Definir campeón y subcampeón al cerrar final.
- Guardar cambios en Supabase.

No implementes fase regional todavía.
```

---

## 18. Prompt para desarrollo de fases regional y estatal

```txt
Implementa los módulos regional y estatal.

Requisitos:

- Consolidar campeones y subcampeones municipales por región.
- Detectar selecciones duplicadas.
- Aplicar regla de conservación de selección.
- Reasignar selección mediante ruleta secundaria.
- Generar bracket regional.
- Definir campeón y subcampeón regional.
- Consolidar finalistas estatales.
- Generar bracket estatal.
- Definir campeón estatal.

Usa las reglas de 02-reglas-del-torneo.md y 04-flujos-operativos.md.
```

---

## 19. Cierre esperado del MVP

El MVP se considera completo cuando:

- Un municipio puede registrar jugadores.
- El sorteo asigna selecciones correctamente.
- El bracket municipal funciona con byes.
- Los marcadores avanzan ganadores.
- Se generan campeón y subcampeón municipal.
- Los clasificados aparecen en región.
- Se detectan y resuelven selecciones repetidas.
- La región genera finalistas estatales.
- La final estatal define campeón.
- El dashboard estatal muestra avance general.
- La app se despliega en Cloudflare Pages.
- Los datos se guardan en Supabase.
```
