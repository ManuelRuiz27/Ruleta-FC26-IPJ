# CODEX Audit Handoff — Mundial FC 26
## Versión extendida con flujo operativo de convocatoria y usuarios

## Objetivo

Auditar, estabilizar y pulir la plataforma **Mundial FC 26 — Ruleta, Brackets y Seguimiento** para dejarla lista para operación del torneo.

Este documento complementa la auditoría técnica con el **flujo real del torneo marcado por la convocatoria**, la intervención de cada tipo de usuario y las reglas operativas que Codex debe validar.

---

# 1. Fuente de verdad funcional

Codex debe tomar como fuente funcional:

```txt
docs/03-requerimientos-funcionales.md
docs/04-flujos-operativos.md
docs/05-modelo-de-datos.md
docs/07-plan-de-pruebas.md
docs/08-deployment.md
```

Además, para la auditoría operativa debe respetar este flujo:

```txt
Municipio
  → Sorteo de selecciones
  → Eliminatoria municipal
  → Campeón y subcampeón municipal
  → Clasificación regional

Región
  → Consolidación de clasificados municipales
  → Resolución de selecciones duplicadas
  → Bracket regional
  → Campeón y subcampeón regional
  → Clasificación estatal

Estado
  → Consolidación de clasificados regionales
  → Resolución de duplicados estatales, si aplica
  → Bracket estatal
  → Campeón estatal
```

---

# 2. Alcance real para mañana

## Debe quedar estable

```txt
- Flujo municipal completo.
- Dashboard regional.
- Resolución de duplicados regionales.
- Bracket regional.
- Pantallas estatales sin crash.
- Persistencia localStorage estable.
- Deploy Vercel funcional.
```

## No debe meterse en esta auditoría

```txt
- Supabase.
- Auth real.
- Realtime.
- Multiusuario con permisos reales.
- Rediseño visual completo.
- Nuevas features no solicitadas.
```

---

# 3. Usuarios operativos y cómo intervienen

## 3.1 Operador municipal

Persona responsable de ejecutar el sorteo y eliminatoria en un municipio.

### Acciones

```txt
1. Selecciona su municipio.
2. Registra participantes.
3. Inicia el sorteo.
4. Ejecuta la ruleta por turno.
5. Valida asignaciones.
6. Genera bracket municipal.
7. Captura marcadores.
8. Cierra eliminatoria municipal.
9. Verifica campeón y subcampeón.
```

### Codex debe validar

```txt
- No puede iniciar sorteo con menos de 8 participantes.
- No puede registrar más de 32.
- No puede asignar dos selecciones al mismo participante.
- No se repite selección dentro del sorteo municipal.
- El bracket municipal se genera después del sorteo completo.
- Los marcadores no aceptan empates sin definición.
- Al cerrar final se generan:
  - completedMunicipalResults
  - qualifiedPlayers
```

---

## 3.2 Operador regional

Persona que revisa los resultados municipales de su región, resuelve duplicados y opera el bracket regional.

### Acciones

```txt
1. Entra al Dashboard Regional.
2. Revisa municipios completados y pendientes.
3. Revisa clasificados generados.
4. Revisa duplicados de selecciones.
5. Si hay duplicados, entra a resolución regional.
6. Aplica criterio de conservación.
7. Reasigna selección al afectado.
8. Genera bracket regional cuando la región esté lista.
9. Captura o valida avances regionales, si el flujo está implementado.
```

### Codex debe validar

```txt
- La región no queda lista si hay municipios pendientes.
- La región no queda lista si hay duplicados.
- Los duplicados se calculan desde qualifiedPlayers.
- completedMunicipalResults no se modifica al resolver duplicados.
- qualifiedPlayers sí cambia team_id cuando hay reasignación.
- teamReassignments registra auditoría.
```

---

## 3.3 Comité estatal / administrador operativo

Persona que revisa el estado completo del torneo.

### Acciones

```txt
1. Entra al Dashboard Estatal.
2. Revisa avance por región.
3. Identifica regiones pendientes.
4. Identifica regiones con duplicados.
5. Revisa clasificación regional.
6. Opera o valida bracket estatal, si está implementado.
```

### Codex debe validar

```txt
- Dashboard estatal no crashea sin datos.
- Muestra regiones reales.
- Muestra avance real.
- No muestra datos hardcodeados.
- Si faltan datos, muestra estados vacíos claros.
```

---

## 3.4 Participante / jugador

Persona que competirá en el torneo.

### Intervención directa

En MVP, el participante no usa cuenta ni captura datos.

Interviene físicamente así:

```txt
1. Da su nombre al operador.
2. Presiona o solicita accionar la ruleta en su turno.
3. Recibe selección asignada.
4. Juega sus partidos.
5. Reporta marcador al operador.
```

### Codex debe validar

```txt
- El nombre aparece correctamente en tablero.
- La selección asignada queda visible.
- El jugador conserva trazabilidad entre municipal y regional.
- source_qualified_player_id se conserva cuando pasa a regional.
```

---

## 3.5 Público / visor

Usuario no operador que mira la pantalla pública o proyección.

### Intervención

```txt
- Observa ruleta.
- Observa tablero.
- Observa brackets.
- Observa resultados.
```

### Codex debe validar

```txt
- La vista no expone errores técnicos.
- La vista es legible en proyector.
- Los datos importantes son visibles:
  - participante
  - selección
  - ronda
  - marcador
  - ganador
```

---

# 4. Flujo de torneo según convocatoria

## 4.1 Fase municipal

Cada municipio realiza su propio sorteo y eliminatoria.

### Flujo

```txt
1. El operador selecciona municipio.
2. Registra participantes.
3. El sistema valida mínimo y máximo.
4. El sistema aleatoriza el orden de turnos.
5. Cada participante acciona ruleta.
6. El sistema asigna una de 32 selecciones disponibles.
7. La selección queda bloqueada para ese municipio.
8. Al terminar sorteo, se genera tablero de asignaciones.
9. Se genera bracket municipal.
10. Se capturan marcadores.
11. Se obtiene campeón y subcampeón municipal.
12. Ambos pasan como clasificados regionales.
```

### Reglas

```txt
- Cada municipio opera su propio sorteo.
- Participantes mínimo: 8.
- Participantes máximo: 32.
- Las selecciones no se repiten dentro de un mismo sorteo municipal.
- Campeón municipal y subcampeón municipal avanzan.
- completedMunicipalResults es histórico.
- qualifiedPlayers es estado competitivo vivo.
```

---

## 4.2 Fase regional

La región recibe clasificados de municipios.

### Flujo

```txt
1. Dashboard regional consolida municipios cerrados.
2. Cada municipio cerrado aporta:
   - campeón
   - subcampeón
3. El sistema detecta selecciones duplicadas en la región.
4. Si no hay duplicados y todos los municipios cerraron, la región queda lista.
5. Si hay duplicados, se abre resolución regional.
6. Al resolver duplicados, se genera bracket regional.
```

### Criterio de desempate / duplicados

```txt
Caso A:
Campeón vs subcampeón con misma selección
→ Campeón conserva selección.
→ Subcampeón recibe nueva selección por sorteo.

Caso B:
Campeón vs campeón con misma selección
→ Se sortea quién conserva.
→ El otro recibe nueva selección.

Caso C:
Subcampeón vs subcampeón con misma selección
→ Se sortea quién conserva.
→ El otro recibe nueva selección.

Caso D:
Más de dos ocurrencias
→ Se determina keeper por prioridad:
   - si hay campeones, solo campeones compiten por conservar.
   - si no hay campeones, compiten todos los subcampeones.
→ Todos los no seleccionados reciben nueva selección uno por uno.
```

### Reglas

```txt
- completedMunicipalResults no se toca.
- qualifiedPlayers.team_id sí se actualiza.
- teamReassignments debe registrar:
  - jugador afectado
  - selección anterior
  - selección nueva
  - quién conservó
  - motivo
  - fecha
```

---

## 4.3 Fase estatal

La fase estatal consolida ganadores regionales.

### Flujo esperado

```txt
1. Cada región cerrada aporta clasificados.
2. Dashboard estatal muestra avance.
3. Si hay duplicados estatales, se resuelven.
4. Se genera bracket estatal.
5. Se captura final estatal.
6. Se obtiene campeón estatal.
```

### Para esta auditoría

Si la fase estatal está implementada:

```txt
- Validar que no crashee.
- Validar estados vacíos.
- Validar que no muestre acciones imposibles.
```

Si no está completa:

```txt
- No implementarla desde cero.
- Solo corregir errores críticos existentes.
```

---

# 5. Estados y entidades que Codex debe cuidar

## 5.1 Entidades localStorage

```txt
currentSession
participants
assignments
bracket
matches
qualifiedPlayers
completedMunicipalResults
teamReassignments
```

## 5.2 Reglas de limpieza

```txt
createMunicipalSession:
- Limpia sesión activa.
- No borra qualifiedPlayers.
- No borra completedMunicipalResults.
- No borra teamReassignments.

resetMunicipalSession:
- Limpia sesión activa.
- No borra historial.

clearLocalTournamentState:
- Puede borrar todo.
```

## 5.3 Estados municipales

```txt
ready_for_draw
drawing
draw_completed
bracket_ready
bracket_active
completed
```

## 5.4 Estados de participante

```txt
registered
assigned
eliminated
champion
runner_up
```

## 5.5 Estados de match

```txt
pending
ready
completed
```

No capturar marcador si el match no está `ready`.

---

# 6. Rutas por usuario

## Operador municipal

```txt
/municipal/:id
/municipal/:id/registro
/municipal/:id/ruleta
/municipal/:id/asignaciones
/municipal/:id/bracket
/municipal/:id/partido/:matchId
```

## Operador regional

```txt
/regional/:regionId
/regional/:regionId/resolucion
/regional/:regionId/bracket
/regional/:regionId/partido/:matchId
```

## Comité estatal

```txt
/estatal/dashboard
/estatal/resolucion
/estatal/bracket
/estatal/partido/:matchId
```

## Público / visor

Puede usar las mismas rutas de dashboard, asignaciones y bracket, pero el MVP actual no tiene control de permisos.

Codex no debe implementar Auth en esta auditoría.

---

# 7. Checklist de auditoría por flujo

## Municipal

```txt
[ ] Registro con 8 participantes.
[ ] Bloqueo con menos de 8.
[ ] Bloqueo con más de 32.
[ ] Sorteo inicia correctamente.
[ ] Turn order aleatorio.
[ ] Ruleta asigna selección.
[ ] No repite selección.
[ ] Tablero muestra asignaciones.
[ ] Bracket municipal genera rondas.
[ ] BYEs avanzan.
[ ] Marcador normal funciona.
[ ] Empate exige resolución.
[ ] Penales empatados bloquean.
[ ] Final genera campeón/subcampeón.
[ ] Se generan qualifiedPlayers.
[ ] Se genera completedMunicipalResults.
```

## Regional

```txt
[ ] Dashboard regional muestra municipios.
[ ] Muestra municipios pendientes.
[ ] Muestra clasificados.
[ ] Detecta duplicados desde qualifiedPlayers.
[ ] Resolución aplica prioridad campeón > subcampeón.
[ ] Mismo rango exige sorteo.
[ ] Reasignación usa selección disponible.
[ ] Se registra teamReassignments.
[ ] Al resolver, desaparece alerta.
[ ] Bracket regional se genera solo si región lista.
```

## Estatal

```txt
[ ] Dashboard estatal abre.
[ ] Resolución estatal abre.
[ ] Bracket estatal abre.
[ ] Estados vacíos no crashean.
[ ] No hay acciones imposibles visibles.
```

---

# 8. P0 para mañana

Corregir de inmediato:

```txt
- Rutas rotas.
- Build roto.
- Hook order errors.
- Pantallas en blanco.
- Pérdida de estado local inesperada.
- Duplicados no resueltos.
- Marcadores inválidos aceptados.
- Bracket que no avanza.
- Final que no genera clasificados.
- Botones que ejecutan acciones en estado incorrecto.
```

---

# 9. No hacer

```txt
- No conectar Supabase.
- No crear Auth.
- No crear backend.
- No reescribir store completo.
- No rehacer UI.
- No crear nuevas pantallas fuera de las existentes.
- No cambiar las reglas del torneo.
```

---

# 10. Entrega esperada de Codex

```md
# Auditoría Codex — Mundial FC 26

## Resultado
- Build:
- Lint:
- Deploy:
- Veredicto:

## Flujo de convocatoria validado
- Municipal:
- Regional:
- Estatal:

## Usuarios validados
- Operador municipal:
- Operador regional:
- Comité estatal:
- Participante:
- Público/visor:

## Bugs críticos encontrados
1.
2.
3.

## Bugs corregidos
1.
2.
3.

## Archivos modificados
-

## Riesgos restantes para mañana
-

## Recomendación final
-
```

---

# 11. Instrucción final

Codex debe trabajar como auditor de producto operativo.

Prioridad:

```txt
1. Que el torneo pueda ejecutarse mañana.
2. Que los roles operativos tengan rutas claras.
3. Que el flujo de convocatoria no se rompa.
4. Que los datos no se pierdan accidentalmente.
5. Que el deploy no falle.
```

No buscar perfección. Buscar estabilidad.
