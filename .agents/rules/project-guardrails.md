# Project Guardrails — Mundial FC 26

## Fuente de verdad

La fuente de verdad está en `/docs`.

No inventes requerimientos. Si algo no está definido, crea una nota en pendientes y no lo implementes.

## Stack permitido

- React
- Vite
- TypeScript
- Tailwind CSS
- Zustand
- Framer Motion
- React Router
- Supabase solo cuando se solicite explícitamente

## Reglas de implementación

- No modificar `/docs`.
- No agregar dependencias sin aprobación.
- No implementar módulos no solicitados.
- No refactorizar archivos fuera del alcance.
- No cambiar modelos de datos sin justificar.
- No conectar Supabase si la tarea no lo pide.
- No usar datos hardcodeados donde ya exista store o catálogo.
- No dejar placeholders en flujos ya funcionales.
- Ejecutar `npm run build` al final de cada tarea.
- No cerrar la tarea si el build falla.

## Flujo de trabajo

Antes de escribir código:
1. Revisar solo los archivos indicados.
2. Identificar el problema exacto.
3. Proponer un mini plan de máximo 5 pasos.

Después de escribir código:
1. Reportar archivos modificados.
2. Reportar validaciones realizadas.
3. Reportar resultado de build.
4. Reportar pendientes reales.