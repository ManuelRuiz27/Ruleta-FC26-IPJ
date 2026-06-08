# Supabase produccion rapida - Mundial FC 26

## Estado implementado

La app ya incluye cliente Supabase y sincronizacion MVP para datos consolidados:

- `completedMunicipalResults`
- `completedRegionalResults`
- `completedStateResults`
- `qualifiedPlayers`
- `teamReassignments`

Las sesiones activas de ruleta/bracket siguen en estado local por sede para reducir riesgo operativo. Al cerrar fases, los resultados se sincronizan a Supabase para dashboards regionales/estatales.

## 1. Crear proyecto Supabase

1. Crear proyecto en Supabase.
2. Copiar:
   - Project URL
   - anon public key
   - project ref

## 2. Aplicar migracion

Aplicar:

```txt
supabase/migrations/001_mvp_cloud_records.sql
```

La migracion crea `public.tournament_records`, RLS basico y realtime.

## 3. Configurar Vercel

Agregar variables en Vercel:

```env
VITE_SUPABASE_URL=https://TU_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=TU_ANON_KEY
VITE_ENABLE_REALTIME=true
VITE_ENABLE_DEMO_MODE=false
VITE_APP_ENV=production
```

Luego redeploy:

```bash
npx vercel --prod
```

## 4. Validar produccion

1. Abrir URL de produccion.
2. Entrar a un municipio con PIN.
3. Completar una eliminatoria de prueba.
4. Abrir dashboard regional desde otro navegador.
5. Confirmar que aparecen clasificados/resultados.

## 5. Reiniciar torneo de pruebas

Desde el acceso estatal:

1. Abrir `/estatal/dashboard`.
2. Entrar con PIN estatal.
3. Presionar `Reiniciar torneo`.
4. Escribir `REINICIAR` para confirmar.

Esto borra `tournament_records` en Supabase y limpia el estado local del navegador actual. Otros navegadores deben recargar o usar `Reset BD` para limpiar su cache local.

## Nota de seguridad

Este modo es MVP rapido con anon key y RLS limitado para escrituras de registros del torneo. Para endurecer seguridad antes de una operacion larga, migrar PINs a Supabase Auth o Edge Function con `pin_hash` y politicas por rol.
