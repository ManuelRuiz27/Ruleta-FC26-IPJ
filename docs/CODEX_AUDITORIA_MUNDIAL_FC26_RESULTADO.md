# Auditoria Codex - Mundial FC 26

## Resultado

- Build: aprobado con `npm run build`.
- Lint: aprobado con `npm run lint`.
- Smoke operativo: aprobado con `npm run smoke:tournament`.
- Deploy: verificacion local aprobada; `vercel.json` y `public/_redirects` existen para rutas SPA. No se ejecuto despliegue remoto desde esta sesion.
- Veredicto: MVP estable para operacion localStorage en los flujos criticos automatizados; falta solo validacion humana final en navegador/proyector antes de torneo real.

## Flujo de convocatoria validado

- Municipal: validado con 26 jornadas municipales, incluyendo San Luis Potosi Capital Dia 1 y Dia 2, 12 participantes con BYEs, bloqueo de empates sin definicion y penales empatados.
- Regional: validado con las 7 regiones, resolucion de duplicados, bracket regional, cierre y resultados persistentes.
- Estatal: validado con generacion de clasificados estatales, resolucion de duplicados, bracket estatal corregido y resultado final.

## Usuarios validados

- Operador municipal: puede registrar, sortear, ver asignaciones, operar bracket y generar campeon/subcampeon sin borrar historial.
- Operador regional: puede revisar avance municipal, resolver duplicados y cerrar bracket regional sin perder resultados previos.
- Comite estatal: puede revisar avance real por region, generar clasificados estatales cuando proceda y operar pantallas estatales existentes.
- Participante: conserva nombre, seleccion y trazabilidad por `source_qualified_player_id` al avanzar de regional a estatal.
- Publico/visor: rutas de dashboard, asignaciones y bracket permanecen visibles sin exponer errores tecnicos por estados vacios comunes.

## Bugs criticos encontrados

1. `completedRegionalResults` y `completedStateResults` no se persistian en localStorage.
2. Cierres regional/estatal y reinicio municipal usaban borrado total, con riesgo de perder historial y clasificados.
3. Botones de cierre regional/estatal no aparecian tras completar la final porque esperaban `bracket_ready` en vez de `completed`.
4. Clasificados estatales podian mostrar `Desconocido` tras limpiar la sesion regional activa.
5. El bracket estatal generaba rondas en orden inverso y podia avanzar ganadores hacia slots incorrectos.
6. El sembrado de datos avanzaba partidos dos veces al usar `submitMatchResult` y `advanceWinnerToNextMatch` manualmente.
7. No habia control de acceso por municipio/region/estado.
8. San Luis Potosi Capital necesitaba dos ruletas por dos dias y el modelo solo contemplaba una sesion por municipio.

## Bugs corregidos

1. Se agrego persistencia de resultados regionales y estatales.
2. Se agrego `resetActiveSession` y se cambio el reinicio municipal/cierre regional/cierre estatal para limpiar solo la sesion activa.
3. `clearLocalTournamentState` queda como borrado total explicito e incluye tambien resultados estatales.
4. Cierre regional y estatal ahora aparece cuando la final deja la sesion en `completed`.
5. Nombres de finalistas estatales y duplicados estatales se recuperan desde `completedRegionalResults` cuando ya no existe la sesion activa.
6. Creacion de resultados regionales y estatales queda idempotente y exige sesion completada.
7. Bracket estatal ahora genera rondas en orden correcto para avanzar de primera ronda a final.
8. Sembrado deja que `submitMatchResult` haga el avance automatico una sola vez.
9. Se agrego smoke automatizado de torneo completo.
10. Se agrego control de acceso MVP por PIN con scopes municipal, regional y estatal.
11. Se agregaron jornadas municipales; San Luis Potosi Capital opera Dia 1 y Dia 2 por separado.

## Archivos modificados

- `src/store/index.ts`
- `src/features/draw/RouletteScreen.tsx`
- `src/features/bracket/RegionalBracket.tsx`
- `src/features/bracket/StateBracket.tsx`
- `src/lib/utils/seed.ts`
- `src/data/access.ts`
- `src/data/municipalEvents.ts`
- `src/components/AccessGate.tsx`
- `src/components/Layout.tsx`
- `src/lib/accessSession.ts`
- `src/lib/municipalRoutes.ts`
- `package.json`
- `scripts/smoke-tournament.ts`
- `docs/CODEX_AUDITORIA_MUNDIAL_FC26_RESULTADO.md`
- `docs/CODEX_ACCESOS_PIN_MVP.md`

## Riesgos restantes para manana

- Falta ejecutar validacion humana final en navegador con datos reales o semilla.
- El chunk principal supera 500 kB; no bloquea operacion, pero Vite lo advierte.
- La fase estatal se mantiene con el contrato interno `stage: 'state'`, aunque la documentacion menciona `state_final`.
- El PIN actual es control MVP local; en Supabase debe migrarse a perfiles/codigos con validacion backend.
- No hay realtime por alcance de esta auditoria.

## Recomendacion final

Liberar despues de una validacion visual breve en navegador/proyector. Para operacion de manana, evitar el boton de borrado total salvo reinicio deliberado de toda la base local y mantener `npm run smoke:tournament` como verificacion previa a cambios.
