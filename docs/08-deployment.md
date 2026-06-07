# 08 — Deployment

## Proyecto

Mundial FC 26 — Plataforma de Sorteo y Seguimiento

## Propósito

Definir la estrategia de despliegue del MVP usando servicios en capa gratuita, con frontend estático, base de datos central, autenticación básica y monitoreo operativo del torneo.

Este documento cubre despliegue, variables de entorno, ambientes, checklist de publicación, rollback y límites operativos.

---

## 1. Estrategia de despliegue

La plataforma se desplegará con arquitectura web ligera:

```txt
React + Vite + TypeScript
        ↓
Cloudflare Pages
        ↓
Supabase
        ├─ PostgreSQL
        ├─ Auth
        ├─ Realtime
        └─ Row Level Security
```

El frontend será una SPA estática publicada en Cloudflare Pages.

La información operativa del torneo se guardará en Supabase PostgreSQL.

---

## 2. Servicios

| Capa | Servicio | Uso |
|---|---|---|
| Frontend | Cloudflare Pages | Hosting de la SPA |
| Base de datos | Supabase PostgreSQL | Persistencia central |
| Autenticación | Supabase Auth | Acceso de operadores |
| Realtime | Supabase Realtime | Actualización de dashboards |
| Archivos | Export local CSV/JSON | No usar storage en MVP |
| Dominio | Cloudflare / subdominio temporal | URL pública del sistema |

---

## 3. Ambientes

## 3.1 Desarrollo local

Uso:

- Desarrollo de componentes.
- Pruebas funcionales.
- Validación de reglas de negocio.

URL esperada:

```txt
http://localhost:5173
```

Comandos:

```bash
npm install
npm run dev
```

## 3.2 Staging

Uso:

- Validación previa con datos de prueba.
- Revisión visual.
- QA funcional.
- Pruebas de operadores.

URL sugerida:

```txt
https://mundial-fc26-staging.pages.dev
```

## 3.3 Producción

Uso:

- Operación oficial del torneo.
- Sorteos municipales.
- Seguimiento regional.
- Final estatal.

URL sugerida:

```txt
https://mundial-fc26.pages.dev
```

o dominio propio:

```txt
https://mundialfc26.gob.mx
```

---

## 4. Repositorio

Estructura sugerida:

```txt
mundial-fc26/
  docs/
  src/
  public/
  supabase/
    migrations/
    seed/
  package.json
  vite.config.ts
  .env.example
  README.md
```

Ramas sugeridas:

| Rama | Uso |
|---|---|
| `main` | Producción |
| `develop` | Desarrollo integrado |
| `feature/*` | Cambios por módulo |
| `hotfix/*` | Correcciones urgentes |

Regla mínima:

- `main` solo recibe cambios probados.
- `develop` puede desplegar a staging.
- Producción no debe apuntar a ramas temporales.

---

## 5. Variables de entorno

Archivo local:

```txt
.env.local
```

Archivo ejemplo para repo:

```txt
.env.example
```

Variables mínimas:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_APP_ENV=local
VITE_APP_NAME="Mundial FC 26"
VITE_ENABLE_REALTIME=true
VITE_ENABLE_DEMO_MODE=false
```

Reglas:

- No subir `.env.local` al repositorio.
- No exponer claves de servicio de Supabase en frontend.
- Solo usar `anon key` en cliente.
- Reglas RLS obligatorias en Supabase.

---

## 6. Supabase

## 6.1 Crear proyecto

1. Crear proyecto en Supabase.
2. Seleccionar región cercana.
3. Guardar:
   - Project URL.
   - Anon public key.
   - Database password.
4. Configurar tablas mediante migraciones.
5. Configurar Row Level Security.
6. Crear usuarios operadores.

## 6.2 Migraciones

Las migraciones deben vivir en:

```txt
supabase/migrations/
```

Ejemplo:

```txt
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_policies.sql
supabase/migrations/003_seed_catalogs.sql
```

## 6.3 Seed inicial

Debe cargar:

- Regiones.
- Municipios participantes.
- Catálogo de 32 selecciones.
- Usuarios base, si aplica.
- Configuración general del torneo.

## 6.4 Realtime

Realtime solo debe activarse en tablas necesarias:

- `draw_sessions`
- `assignments`
- `matches`
- `qualified_players`
- `regions`
- `municipalities`

No activar realtime en:

- `audit_logs`
- tablas de catálogo que no cambian durante el evento
- tablas de configuración estática

---

## 7. Cloudflare Pages

## 7.1 Configuración de build

Configuración esperada:

```txt
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: /
Node version: 20
```

## 7.2 Variables en Cloudflare Pages

Configurar en el panel de Cloudflare:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_APP_ENV=production
VITE_APP_NAME="Mundial FC 26"
VITE_ENABLE_REALTIME=true
VITE_ENABLE_DEMO_MODE=false
```

Para staging:

```env
VITE_APP_ENV=staging
VITE_ENABLE_DEMO_MODE=true
```

## 7.3 Deploy automático

Flujo:

```txt
Push a develop
  ↓
Deploy a staging

Push a main
  ↓
Deploy a producción
```

No publicar producción manualmente salvo hotfix urgente.

---

## 8. Seguridad mínima

## 8.1 Reglas

- No usar service role key en frontend.
- Activar RLS en tablas operativas.
- Los operadores municipales solo deben editar su municipio.
- Los operadores regionales solo deben editar su región.
- El comité estatal puede ver y administrar todo.
- Las correcciones deben auditarse.

## 8.2 Roles del sistema

| Rol | Permisos |
|---|---|
| `municipal_operator` | Operar su municipio |
| `regional_operator` | Operar su región |
| `state_admin` | Operar todo |
| `public_viewer` | Solo lectura pública |

## 8.3 Acceso público

Las pantallas públicas solo deben exponer:

- Ruleta.
- Tablero de asignaciones.
- Bracket.
- Resultados.

No deben exponer:

- Emails de operadores.
- Logs internos.
- Claves internas.
- Configuración de Supabase.

---

## 9. Operación offline parcial

La plataforma debe considerar mala conexión en sedes municipales.

## 9.1 Comportamiento esperado

Si falla la conexión:

1. El sistema guarda cambios localmente.
2. Marca el estado como `pending_sync`.
3. Muestra alerta visible al operador.
4. Intenta sincronizar al recuperar conexión.

## 9.2 Restricción

No se puede cerrar oficialmente una fase con cambios pendientes de sincronización.

Mensaje sugerido:

```txt
Existen cambios pendientes de sincronizar. Conecta a internet antes de cerrar esta fase.
```

---

## 10. Checklist previo a producción

## 10.1 Frontend

- [ ] `npm install` ejecuta sin errores.
- [ ] `npm run build` ejecuta sin errores.
- [ ] No hay errores críticos de TypeScript.
- [ ] No hay rutas rotas.
- [ ] La ruleta funciona en pantalla 16:9.
- [ ] El dashboard se ve correctamente en proyector.
- [ ] El modo público no permite edición.
- [ ] Export CSV funciona.
- [ ] Export JSON funciona.

## 10.2 Supabase

- [ ] Tablas creadas.
- [ ] Migraciones aplicadas.
- [ ] Seed de municipios cargado.
- [ ] Seed de selecciones cargado.
- [ ] RLS activo.
- [ ] Políticas probadas por rol.
- [ ] Usuarios operadores creados.
- [ ] Realtime activo solo en tablas necesarias.

## 10.3 Datos

- [ ] Municipios validados.
- [ ] Regiones validadas.
- [ ] Fechas validadas.
- [ ] Selecciones activas = 32.
- [ ] No hay selecciones duplicadas.
- [ ] No hay municipios sin región.

## 10.4 QA operativo

- [ ] Crear eliminatoria municipal.
- [ ] Registrar 8 participantes.
- [ ] Registrar 32 participantes.
- [ ] Bloquear menos de 8 participantes.
- [ ] Ejecutar sorteo completo.
- [ ] Generar bracket.
- [ ] Capturar marcador normal.
- [ ] Capturar empate con penales.
- [ ] Cerrar municipio.
- [ ] Consolidar región.
- [ ] Resolver duplicidad.
- [ ] Cerrar fase regional.
- [ ] Cerrar final estatal.

---

## 11. Smoke test de producción

Después de publicar producción:

1. Abrir URL pública.
2. Iniciar sesión con usuario de prueba.
3. Confirmar conexión a Supabase.
4. Crear sesión demo.
5. Registrar 8 participantes de prueba.
6. Ejecutar un giro.
7. Confirmar que el dashboard se actualiza.
8. Exportar CSV.
9. Eliminar o limpiar datos de prueba.
10. Confirmar que no hay errores en consola.

---

## 12. Rollback

## 12.1 Rollback de frontend

Cloudflare Pages permite regresar a un deployment anterior desde el panel.

Procedimiento:

1. Ir al proyecto en Cloudflare Pages.
2. Abrir historial de deployments.
3. Seleccionar último deployment estable.
4. Promoverlo a producción.
5. Validar URL pública.

## 12.2 Rollback de base de datos

Para MVP no se recomienda rollback automático destructivo.

Regla:

- Las migraciones deben ser incrementales.
- No borrar columnas o tablas durante el torneo.
- Si se requiere cambio estructural, crear nueva columna y migrar datos.
- Respaldar antes de cada cambio relevante.

---

## 13. Backups

## 13.1 Antes del torneo

Exportar respaldo inicial:

- Esquema.
- Catálogos.
- Usuarios operadores.

## 13.2 Durante el torneo

Exportar resultados diarios en CSV/JSON:

- Municipios.
- Participantes.
- Asignaciones.
- Partidos.
- Clasificados.
- Auditoría.

## 13.3 Después del torneo

Generar respaldo final:

```txt
mundial-fc26-backup-final-yyyy-mm-dd.zip
```

Contenido:

- JSON completo.
- CSV por fase.
- Auditoría.
- Campeón estatal.
- Clasificados finales.

---

## 14. Límites de capa gratuita

## 14.1 Cloudflare Pages

La capa gratuita de Cloudflare Pages es suficiente para el frontend estático del MVP.

Consideraciones:

- No ejecutar procesos backend ahí.
- No depender de funciones serverless para reglas críticas.
- Mantener el frontend como SPA estática.

## 14.2 Supabase Free

La capa gratuita de Supabase es suficiente si se limita el sistema a datos operativos.

No guardar:

- Videos.
- Fotografías.
- Capturas pesadas.
- Logs excesivos.
- Eventos minuto a minuto.

Guardar únicamente:

- Municipios.
- Participantes.
- Asignaciones.
- Partidos.
- Marcadores.
- Clasificados.
- Reasignaciones.
- Auditoría mínima.

## 14.3 Señales para subir a plan pagado

Considerar plan pagado si ocurre cualquiera de estos casos:

- El sistema se usará permanentemente.
- Se requiere histórico multi-año.
- Muchos usuarios públicos abren dashboard en tiempo real.
- Se necesita soporte formal.
- Se supera el límite de base de datos.
- Se requiere mayor disponibilidad institucional.

---

## 15. Monitoreo operativo

Durante el evento, el comité debe revisar:

- Municipios en curso.
- Sesiones con `pending_sync`.
- Duplicidades pendientes.
- Partidos sin cerrar.
- Correcciones de marcador.
- Usuarios con errores de acceso.
- Fallos de realtime.

No se requiere observabilidad avanzada para MVP.

---

## 16. Plan de publicación

## Fase 1 — Staging

Objetivo: validar operación completa con datos falsos.

Duración sugerida: 1 día.

Criterio de salida:

- Sorteo completo probado.
- Bracket probado.
- Marcadores probados.
- Regional probado.
- Final estatal simulada.

## Fase 2 — Piloto municipal

Objetivo: probar con un municipio real o simulación pública.

Criterio de salida:

- Operador pudo usar el sistema sin asistencia técnica constante.
- No hubo pérdida de datos.
- Exportaciones generadas correctamente.

## Fase 3 — Producción

Objetivo: abrir operación oficial.

Criterio de salida:

- Todos los catálogos validados.
- Usuarios creados.
- URL final publicada.
- Checklist completo.

---

## 17. Referencias técnicas

- Cloudflare Pages: https://pages.cloudflare.com/
- Cloudflare Pages limits: https://developers.cloudflare.com/pages/platform/limits/
- Supabase Pricing: https://supabase.com/pricing
- Supabase Billing and Quotas: https://supabase.com/docs/guides/platform/billing-on-supabase
- Vite Static Deploy: https://vite.dev/guide/static-deploy
- Vite Build: https://vite.dev/guide/build
