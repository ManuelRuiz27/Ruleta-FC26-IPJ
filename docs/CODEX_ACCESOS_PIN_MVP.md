# Accesos PIN MVP - Mundial FC 26

## Alcance

Este control es temporal para operar el MVP sin implementar Auth completo. En Supabase debe reemplazarse por perfiles, roles y validacion del PIN en backend.

## Formato de PIN

- Comite estatal: `ESTADO-2026`
- Region: `REG-{numero}`
- Municipio: `MUN-{numero}`

## Ejemplos

- Matehuala: ruta `/municipal/mun-5`, PIN `MUN-5`
- Region Centro: ruta `/regional/reg-3`, PIN `REG-3`
- Comite estatal: ruta `/estatal/dashboard`, PIN `ESTADO-2026`

## San Luis Potosi Capital

San Luis Potosi Capital tiene dos jornadas municipales separadas:

- Dia 1: `/municipal/mun-25/evento/mun-25-day-1/registro`
- Dia 2: `/municipal/mun-25/evento/mun-25-day-2/registro`

Ambas usan el PIN municipal `MUN-25`.

Cada jornada tiene ruleta, asignaciones, bracket y clasificados propios. En regional Centro se contabilizan como dos jornadas completables del mismo municipio.

## Reglas de acceso

- PIN municipal: solo accede a su municipio.
- PIN regional: accede a su region y municipios de su region para supervision operativa.
- PIN estatal: accede a todo.

## Pendiente Supabase

Migrar `src/data/access.ts` a tabla de perfiles o tabla de access codes con:

- rol
- municipality_id
- region_id
- pin_hash
- activo
- ultimo_acceso
