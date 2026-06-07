# Reglas de Negocio — Mundial FC 26

## 1. Fuente de verdad

Las reglas de negocio del sistema se basan en:

1. Convocatoria oficial Mundial FC 26.
2. Lista oficial de municipios participantes.
3. Formato de competencia municipal, regional y estatal.
4. Decisiones operativas definidas para la plataforma.

Cuando exista contradicción entre una propuesta técnica y la convocatoria, prevalece la convocatoria.

---

# 2. Reglas generales del torneo

## RN-01 — Modalidad

El torneo se juega en modalidad 1 vs 1 en EA Sports FC 26.

## RN-02 — Formato de competencia

El formato oficial es eliminación directa.

No habrá fase de grupos, tabla general ni acumulación de puntos.

## RN-03 — Fases

El torneo se divide en tres fases:

1. Eliminatoria municipal.
2. Fase regional.
3. Gran final estatal.

## RN-04 — Clasificación municipal

De cada eliminatoria municipal clasifican:

- Campeón municipal.
- Subcampeón municipal.

## RN-05 — Clasificación regional

De cada fase regional clasifican:

- Campeón regional.
- Subcampeón regional.

## RN-06 — Final estatal

La final estatal recibe a los campeones y subcampeones regionales.

---

# 3. Reglas de participantes

## RN-07 — Mínimo de participantes municipal

Cada eliminatoria municipal debe tener mínimo 8 participantes.

El sistema no debe permitir iniciar una eliminatoria oficial con menos de 8 jugadores.

## RN-08 — Máximo de participantes municipal

Cada eliminatoria municipal debe tener máximo 32 participantes.

El sistema no debe permitir registrar más de 32 jugadores en una misma sesión municipal.

## RN-09 — Nombres de participantes

Cada participante debe tener un nombre visible.

No se permiten nombres vacíos.

## RN-10 — Duplicidad de nombres

No se permiten nombres duplicados dentro de una misma sesión municipal.

Si dos personas tienen el mismo nombre, el operador debe agregar un identificador adicional.

Ejemplo:

- Juan Pérez A
- Juan Pérez B

## RN-11 — Edición de participantes

Los participantes pueden editarse mientras la sesión esté en estado `draft`.

Después de iniciar el sorteo, los participantes quedan bloqueados.

## RN-12 — Eliminación de participantes

Solo se puede eliminar participantes antes de iniciar el sorteo.

Una vez iniciado el sorteo, no se permite eliminar jugadores.

---

# 4. Reglas del sorteo de selecciones

## RN-13 — Catálogo de selecciones

El sistema debe manejar un catálogo cerrado de 32 selecciones definidas por el comité organizador.

No se debe presentar como “las 32 selecciones del Mundial 2026”, porque el Mundial 2026 real tiene otro formato.

Nombre recomendado:

> Selecciones oficiales del sorteo

## RN-14 — Asignación única municipal

Dentro de una misma sesión municipal, una selección solo puede asignarse a un participante.

## RN-15 — Orden aleatorio

Antes de iniciar el sorteo, el sistema debe generar un orden aleatorio de participantes.

El orden generado queda bloqueado.

## RN-16 — Resultado calculado antes de animación

El resultado del giro debe calcularse antes de ejecutar la animación de ruleta.

La animación solo representa visualmente el resultado ya determinado.

## RN-17 — Bloqueo de giro

Mientras la ruleta está girando:

- El botón queda deshabilitado.
- No se permite cambiar participante.
- No se permite registrar otro resultado.

## RN-18 — Persistencia inmediata

Cada asignación debe guardarse inmediatamente en base de datos.

Si falla la conexión, el sistema debe marcar la asignación como `pending_sync`.

## RN-19 — Cierre de sorteo

El sorteo municipal solo puede cerrarse cuando todos los participantes tengan selección asignada.

---

# 5. Reglas del bracket

## RN-20 — Generación de bracket

El bracket se genera después de terminar el sorteo de selecciones.

## RN-21 — Eliminación directa

Cada partido produce un ganador y un eliminado.

El ganador avanza a la siguiente ronda.

## RN-22 — Cantidades no potencia de 2

Si el número de participantes no es potencia de 2, el sistema debe generar byes.

Ejemplo:

- 8 jugadores: bracket directo de 8.
- 12 jugadores: bracket de 16 con 4 byes.
- 24 jugadores: bracket de 32 con 8 byes.
- 32 jugadores: bracket completo.

## RN-23 — Byes

Un bye significa que el jugador avanza automáticamente a la siguiente ronda.

El sistema debe registrar el avance como automático, no como partido jugado.

## RN-24 — Orden del bracket

El bracket puede generarse con base en:

1. Orden aleatorio del sorteo.
2. Orden de asignación.
3. Semilla aleatoria generada al iniciar bracket.

Para MVP se usará orden aleatorio controlado por sesión.

## RN-25 — Bloqueo de bracket

Una vez iniciado el primer partido, el bracket queda bloqueado.

No se permite regenerar bracket salvo corrección administrativa con auditoría.

---

# 6. Reglas de marcador

## RN-26 — Captura de marcador final

El sistema solo captura marcador final.

No se captura minuto a minuto.

## RN-27 — Marcador regular

Cada partido debe registrar:

- Goles jugador A.
- Goles jugador B.

## RN-28 — Empate

Si el marcador regular queda empatado, el sistema debe exigir definición.

La convocatoria contempla tiempos extra y penales.

## RN-29 — Tiempos extra

Si el partido se empató en tiempo regular, el operador debe indicar si hubo tiempos extra.

## RN-30 — Penales

Si después del tiempo extra sigue el empate, el operador debe capturar marcador de penales.

## RN-31 — Ganador obligatorio

No se permite cerrar un partido sin ganador.

## RN-32 — Validación de penales

Si se capturan penales, el marcador de penales no puede quedar empatado.

## RN-33 — Cierre de partido

Al cerrar un partido:

- Se bloquea el marcador.
- Se registra ganador.
- Se registra perdedor.
- El ganador avanza automáticamente.

## RN-34 — Corrección de marcador

Un marcador cerrado solo puede corregirse con auditoría.

Debe registrarse:

- Usuario.
- Fecha/hora.
- Marcador anterior.
- Marcador nuevo.
- Motivo de corrección.

---

# 7. Reglas de campeón y subcampeón

## RN-35 — Campeón municipal

El ganador de la final municipal será campeón municipal.

## RN-36 — Subcampeón municipal

El perdedor de la final municipal será subcampeón municipal.

## RN-37 — Clasificados municipales

Campeón y subcampeón municipal pasan a fase regional.

## RN-38 — Campeón regional

El ganador de la final regional será campeón regional.

## RN-39 — Subcampeón regional

El perdedor de la final regional será subcampeón regional.

## RN-40 — Clasificados estatales

Campeón y subcampeón regional pasan a la final estatal.

---

# 8. Reglas de duplicidad de selecciones

## RN-41 — Duplicidad permitida entre municipios

Es válido que dos municipios distintos tengan clasificados con la misma selección.

La duplicidad se resuelve antes de iniciar fase regional.

## RN-42 — Detección de duplicados regionales

Antes de iniciar fase regional, el sistema debe detectar selecciones repetidas entre clasificados de la misma región.

## RN-43 — Prioridad para conservar selección

Si hay duplicidad:

1. Campeón municipal conserva selección sobre subcampeón municipal.
2. Si ambos tienen el mismo rango, se sortea quién conserva.
3. El jugador que no conserva debe recibir nueva selección.

## RN-44 — Ruleta de reasignación

La reasignación debe hacerse mediante una ruleta secundaria con selecciones disponibles.

## RN-45 — Selecciones bloqueadas

La ruleta de reasignación no debe incluir:

- Selecciones ya conservadas por otros clasificados.
- La selección original que causó duplicidad.

## RN-46 — Auditoría de reasignación

Toda reasignación debe guardar:

- Participante afectado.
- Selección anterior.
- Selección nueva.
- Motivo.
- Fecha/hora.
- Usuario operador.

---

# 9. Reglas de estados

## RN-47 — Estado de sesión municipal

Una sesión municipal puede estar en:

- draft
- active_draw
- draw_completed
- bracket_active
- completed
- locked

## RN-48 — Estado de partido

Un partido puede estar en:

- pending
- ready
- completed
- locked
- corrected

## RN-49 — Estado de participante

Un participante puede estar en:

- registered
- assigned
- playing
- eliminated
- champion
- runner_up
- qualified

## RN-50 — Estado de región

Una región puede estar en:

- pending
- waiting_municipal_results
- resolving_duplicates
- regional_active
- regional_completed
- locked

---

# 10. Reglas de cierre

## RN-51 — Cierre municipal

Una eliminatoria municipal solo puede cerrarse si:

- Todos los participantes tienen selección.
- El bracket fue completado.
- Existe campeón municipal.
- Existe subcampeón municipal.

## RN-52 — Cierre regional

Una fase regional solo puede cerrarse si:

- Todos los clasificados municipales están registrados.
- No hay duplicidades pendientes.
- El bracket regional fue completado.
- Existe campeón regional.
- Existe subcampeón regional.

## RN-53 — Cierre estatal

La final estatal solo puede cerrarse si:

- Todos los finalistas regionales están registrados.
- No hay duplicidades pendientes.
- Todos los partidos estatales están completados.
- Existe campeón estatal.

---

# 11. Reglas de auditoría

## RN-54 — Acciones auditables

Deben auditarse:

- Inicio de sorteo.
- Asignación de selección.
- Regeneración de bracket.
- Captura de marcador.
- Corrección de marcador.
- Reasignación de selección.
- Cierre de fase.
- Reapertura de fase.

## RN-55 — Datos mínimos de auditoría

Cada evento de auditoría debe guardar:

- ID de usuario.
- Acción.
- Entidad afectada.
- Valor anterior.
- Valor nuevo.
- Motivo, si aplica.
- Fecha/hora.

---

# 12. Reglas de operación offline parcial

## RN-56 — Pérdida de conexión

Si el sistema pierde conexión durante una eliminatoria:

- Debe permitir continuar solo si los datos pueden guardarse localmente.
- Debe marcar los cambios como `pending_sync`.
- Debe advertir al operador que debe sincronizar antes de cerrar oficialmente.

## RN-57 — Cierre con datos pendientes

No se debe permitir cerrar una fase si hay datos pendientes de sincronizar.

---

# 13. Reglas visuales

## RN-58 — Pantalla pública

La pantalla de ruleta debe ser apta para mostrarse en proyector o pantalla grande.

## RN-59 — Botón principal único

En la pantalla de ruleta solo debe existir un botón principal:

> Girar ruleta

## RN-60 — Diseño sobrio

La interfaz debe usar una estética oscura tipo blueprint, con superficies planas, bordes finos, tipografía geométrica y acento visual limitado.

## RN-61 — Banderas

Las banderas pueden ser el principal elemento colorido de la pantalla.

El resto de la interfaz debe mantenerse sobria para no competir visualmente.