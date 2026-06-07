# Mundial FC 26 — Plataforma de Sorteo y Seguimiento

## Objetivo

Desarrollar una plataforma web para administrar el sorteo de selecciones, seguimiento de eliminatorias municipales, fases regionales y final estatal del torneo Mundial FC 26.

La plataforma debe permitir:

- Registrar participantes por municipio.
- Asignar selecciones mediante ruleta.
- Generar brackets de eliminación directa.
- Registrar marcadores finales por partido.
- Determinar campeón y subcampeón municipal.
- Consolidar clasificados regionales.
- Resolver selecciones repetidas entre clasificados.
- Registrar ganadores regionales.
- Monitorear la final estatal.
- Mostrar dashboards públicos y administrativos.

## Fuente de verdad

1. Convocatoria oficial Mundial FC 26.
2. Lista de municipios participantes.
3. Reglas de torneo establecidas por comité.
4. Diseño visual basado en `DESIGN.md`.

## Stack propuesto

- Frontend: React + Vite + TypeScript.
- UI: Tailwind CSS + Framer Motion.
- Estado frontend: Zustand.
- Backend/BaaS: Supabase.
- Base de datos: PostgreSQL en Supabase.
- Realtime: Supabase Realtime.
- Hosting frontend: Cloudflare Pages.
- Exportaciones: CSV / JSON.

## Documentos

| Archivo | Propósito |
|---|---|
| `01_PRODUCT_BRIEF.md` | Define objetivo, alcance y problema |
| `02_SRS_REQUERIMIENTOS.md` | Requerimientos funcionales y no funcionales |
| `03_REGLAS_NEGOCIO.md` | Reglas oficiales del torneo |
| `04_FLUJOS_FUNCIONALES.md` | Flujo municipal, regional y estatal |
| `05_MODELO_DATOS.md` | Entidades, relaciones y tablas |
| `06_API_CONTRACTS.md` | Endpoints o contratos Supabase |
| `07_UI_UX_SPEC.md` | Pantallas, estética y comportamiento visual |
| `08_QA_TEST_PLAN.md` | Casos de prueba y validaciones |
| `09_DEPLOYMENT.md` | Despliegue en capa gratuita |
| `10_AGENT_HANDOFF.md` | Instrucciones para agente de desarrollo |

## Decisiones iniciales

- El sistema sí tendrá backend/BaaS para monitoreo central.
- No se implementará backend propio en MVP.
- No se implementará marcador en vivo.
- Solo se capturará marcador final de partido.
- El bracket será eliminación directa.
- La etapa municipal requiere mínimo 8 y máximo 32 jugadores.
- La ruleta asignará selecciones sin repetición dentro de una misma sesión municipal.
- Las selecciones repetidas entre municipios se resolverán antes de fase regional.