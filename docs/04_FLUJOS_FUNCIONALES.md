# 04 — Flujos Operativos

**Proyecto:** Mundial FC 26 — Plataforma de Sorteo y Seguimiento  
**Tipo de documento:** Especificación operativa  
**Versión:** 0.1  
**Estado:** Borrador funcional  
**Fuente principal:** Convocatoria oficial Mundial FC 26 y decisiones de alcance del MVP.

---

## 1. Propósito

Definir los flujos operativos que debe soportar la plataforma para administrar el torneo desde la eliminatoria municipal hasta la final estatal.

Este documento describe la secuencia de operación del sistema, los actores involucrados, las entradas, salidas, validaciones y excepciones principales.

No define componentes visuales, modelo de base de datos, contratos API ni detalles de implementación.

---

## 2. Alcance del documento

Este documento cubre:

- Configuración inicial del torneo.
- Registro de participantes municipales.
- Sorteo de selecciones mediante ruleta.
- Generación de bracket municipal.
- Captura de marcadores.
- Cierre de eliminatoria municipal.
- Consolidación regional.
- Resolución de selecciones repetidas.
- Fase regional.
- Final estatal.
- Correcciones operativas.
- Exportación de resultados.

Este documento no cubre:

- Diseño UI detallado.
- Esquema de base de datos.
- Endpoints.
- Seguridad técnica.
- Deploy.
- Pruebas automatizadas.

---

## 3. Actores

### 3.1 Comité estatal

Responsable de configurar, supervisar y cerrar el torneo.

Permisos principales:

- Validar municipios y regiones.
- Supervisar todas las fases.
- Corregir errores operativos con auditoría.
- Reabrir fases cuando sea necesario.
- Cerrar la final estatal.

---

### 3.2 Operador regional

Responsable de operar una fase regional.

Permisos principales:

- Consultar clasificados municipales de su región.
- Resolver duplicidad de selecciones.
- Generar bracket regional.
- Capturar marcadores regionales.
- Cerrar fase regional.

---

### 3.3 Operador municipal

Responsable de operar una eliminatoria municipal.

Permisos principales:

- Registrar participantes.
- Ejecutar sorteo municipal.
- Generar bracket municipal.
- Capturar marcadores municipales.
- Cerrar eliminatoria municipal.

---

### 3.4 Público

Usuario sin permisos de edición.

Puede visualizar:

- Ruleta.
- Tablero de asignaciones.
- Brackets.
- Marcadores.
- Avance general del torneo.

---

## 4. Estados operativos

### 4.1 Estado de eliminatoria municipal

| Estado | Descripción |
|---|---|
| `draft` | La eliminatoria existe, pero los participantes aún pueden editarse. |
| `ready_for_draw` | Participantes validados. El sorteo puede iniciar. |
| `drawing` | Sorteo de selecciones en curso. |
| `draw_completed` | Todos los participantes tienen selección asignada. |
| `bracket_ready` | Bracket generado, aún sin partidos iniciados. |
| `bracket_active` | Partidos municipales en curso. |
| `completed` | Campeón y subcampeón municipal definidos. |
| `locked` | Eliminatoria cerrada y bloqueada. |

---

### 4.2 Estado de fase regional

| Estado | Descripción |
|---|---|
| `waiting_municipal_results` | Faltan eliminatorias municipales por cerrar. |
| `pending_duplicate_resolution` | Existen selecciones repetidas entre clasificados. |
| `ready_for_bracket` | Clasificados validados y sin duplicidades pendientes. |
| `bracket_active` | Partidos regionales en curso. |
| `completed` | Campeón y subcampeón regional definidos. |
| `locked` | Fase regional cerrada y bloqueada. |

---

### 4.3 Estado de partido

| Estado | Descripción |
|---|---|
| `pending` | Partido creado, pero aún no tiene ambos jugadores definidos. |
| `ready` | Partido listo para jugarse. |
| `completed` | Marcador capturado y ganador definido. |
| `locked` | Resultado bloqueado. |
| `correction_required` | Partido marcado para revisión por error operativo. |

---

## 5. Flujo general del torneo

```text
Configuración inicial
        ↓
Eliminatorias municipales
        ↓
Campeón y subcampeón municipal
        ↓
Consolidación regional
        ↓
Resolución de selecciones repetidas
        ↓
Fase regional
        ↓
Campeón y subcampeón regional
        ↓
Consolidación estatal
        ↓
Final estatal
        ↓
Campeón estatal
        ↓
Cierre del torneo
```

---

## 6. Flujo 01 — Configuración inicial

### Actor principal

Comité estatal.

### Objetivo

Preparar la plataforma antes de iniciar las eliminatorias municipales.

### Entradas

- Catálogo de regiones.
- Catálogo de municipios participantes.
- Catálogo de selecciones disponibles.
- Usuarios operadores.
- Fechas de fases, si están disponibles.

### Proceso

1. El comité estatal accede al panel administrativo.
2. El sistema muestra regiones y municipios precargados.
3. El comité valida la relación municipio-región.
4. El comité valida el catálogo de selecciones activas.
5. El comité asigna operadores municipales y regionales, si aplica.
6. El sistema deja las eliminatorias municipales en estado `draft`.

### Validaciones

- Cada municipio debe pertenecer a una región.
- El catálogo de selecciones debe estar activo antes de cualquier sorteo.
- No debe haber selecciones duplicadas en el catálogo.
- No debe haber municipios duplicados.

### Salida

Torneo listo para iniciar eliminatorias municipales.

---

## 7. Flujo 02 — Registro de participantes municipales

### Actor principal

Operador municipal.

### Objetivo

Registrar a los jugadores que participarán en la eliminatoria de un municipio.

### Entradas

- Municipio asignado.
- Nombre de participantes.

### Proceso

1. El operador municipal abre la eliminatoria de su municipio.
2. El sistema muestra la eliminatoria en estado `draft`.
3. El operador registra participantes.
4. El sistema valida la lista.
5. El operador confirma la lista de participantes.
6. El sistema cambia el estado a `ready_for_draw`.

### Validaciones

- La eliminatoria oficial debe tener mínimo 8 participantes.
- La eliminatoria oficial debe tener máximo 32 participantes.
- No se permiten nombres vacíos.
- No se permiten nombres repetidos dentro de la misma eliminatoria.
- No se puede editar la lista después de iniciar el sorteo.

### Salida

Participantes registrados y listos para sorteo.

### Excepciones

| Caso | Resultado |
|---|---|
| Menos de 8 participantes | El sistema bloquea el inicio. |
| Más de 32 participantes | El sistema bloquea registros adicionales. |
| Nombre duplicado | El sistema solicita corrección. |
| Eliminatoria ya iniciada | El sistema bloquea edición. |

---

## 8. Flujo 03 — Sorteo municipal de selecciones

### Actor principal

Operador municipal.

### Actor secundario

Participante, si el evento permite que el jugador presione el botón de giro.

### Objetivo

Asignar una selección a cada participante mediante una ruleta visual.

### Entradas

- Participantes validados.
- Catálogo de selecciones activas.
- Eliminatoria en estado `ready_for_draw`.

### Proceso

1. El operador presiona `Iniciar sorteo`.
2. El sistema aleatoriza el orden de participación.
3. El sistema cambia el estado a `drawing`.
4. El sistema muestra al participante actual.
5. El operador o participante presiona `Girar ruleta`.
6. El sistema selecciona una selección disponible.
7. La ruleta anima el resultado.
8. El sistema guarda la asignación.
9. El tablero público se actualiza.
10. El sistema avanza al siguiente participante.
11. El proceso se repite hasta asignar selección a todos.
12. El sistema cambia el estado a `draw_completed`.

### Validaciones

- El botón de giro debe bloquearse mientras la ruleta está girando.
- Una selección no puede asignarse dos veces dentro de la misma eliminatoria municipal.
- Un participante no puede girar más de una vez.
- El resultado debe guardarse antes de avanzar al siguiente participante.
- Si falla la conexión, el resultado debe quedar marcado como pendiente de sincronización.

### Salida

Todos los participantes tienen selección asignada.

### Excepciones

| Caso | Resultado |
|---|---|
| Error al guardar asignación | El sistema marca la asignación como `pending_sync`. |
| Recarga de página durante sorteo | El sistema debe recuperar el estado guardado. |
| Selección ya asignada | El sistema descarta esa selección y calcula otra disponible. |

---

## 9. Flujo 04 — Generación de bracket municipal

### Actor principal

Operador municipal.

### Objetivo

Crear la llave de eliminación directa para la eliminatoria municipal.

### Entradas

- Eliminatoria en estado `draw_completed`.
- Participantes con selección asignada.

### Proceso

1. El operador presiona `Generar bracket`.
2. El sistema calcula el tamaño de bracket requerido.
3. El sistema asigna byes si el número de participantes no es potencia de 2.
4. El sistema genera los partidos de primera ronda.
5. El sistema muestra el bracket municipal.
6. El estado cambia a `bracket_ready`.

### Reglas operativas

- 8 participantes generan bracket de 8.
- 9 a 16 participantes generan bracket de 16.
- 17 a 32 participantes generan bracket de 32.
- Los byes representan avance automático, no partidos jugados.
- Una vez iniciado el primer partido, el bracket no puede regenerarse sin autorización.

### Salida

Bracket municipal generado.

---

## 10. Flujo 05 — Captura de marcador municipal

### Actor principal

Operador municipal.

### Objetivo

Registrar el resultado final de cada partido municipal y avanzar al ganador.

### Entradas

- Bracket municipal generado.
- Partido en estado `ready`.

### Proceso

1. El operador selecciona un partido listo.
2. El sistema muestra jugadores y selecciones.
3. El operador captura marcador regular.
4. El sistema evalúa si existe empate.
5. Si no hay empate, el sistema propone ganador.
6. Si hay empate, el sistema solicita datos de definición:
   - Tiempos extra.
   - Penales, si aplica.
7. El operador confirma el ganador.
8. El sistema cierra el partido.
9. El ganador avanza a la siguiente ronda.
10. El perdedor queda eliminado.

### Validaciones

- No se permiten marcadores negativos.
- No se permite cerrar un partido empatado sin ganador.
- Si se capturan penales, los penales no pueden quedar empatados.
- El ganador debe ser uno de los dos jugadores del partido.
- Un partido cerrado no puede editarse directamente.

### Salida

Partido completado y bracket actualizado.

### Excepciones

| Caso | Resultado |
|---|---|
| Marcador empatado sin penales | El sistema exige definición. |
| Error de captura después de cerrar | Debe usarse flujo de corrección. |
| Ganador no coincide con marcador | El sistema solicita confirmación o bloquea según regla configurada. |

---

## 11. Flujo 06 — Cierre de eliminatoria municipal

### Actor principal

Operador municipal.

### Objetivo

Cerrar la etapa municipal y generar clasificados regionales.

### Entradas

- Bracket municipal completado.
- Final municipal cerrada.

### Proceso

1. El sistema identifica al ganador de la final municipal.
2. El sistema identifica al perdedor de la final municipal.
3. El ganador queda como campeón municipal.
4. El perdedor queda como subcampeón municipal.
5. El sistema registra ambos como clasificados regionales.
6. El operador confirma cierre.
7. El estado cambia a `completed`.
8. El comité estatal puede bloquear la eliminatoria en estado `locked`.

### Validaciones

- No puede cerrarse una eliminatoria sin campeón.
- No puede cerrarse una eliminatoria sin subcampeón.
- No puede cerrarse si hay partidos pendientes.
- No puede cerrarse si existen cambios pendientes de sincronización.

### Salida

Campeón y subcampeón municipal registrados.

---

## 12. Flujo 07 — Consolidación regional

### Actor principal

Operador regional.

### Actor secundario

Comité estatal.

### Objetivo

Agrupar a los clasificados municipales de una región para preparar la fase regional.

### Entradas

- Eliminatorias municipales cerradas.
- Campeones y subcampeones municipales.

### Proceso

1. El operador regional abre el dashboard de su región.
2. El sistema lista los municipios de la región.
3. El sistema muestra el estado de cada eliminatoria municipal.
4. Si faltan municipios por cerrar, la región permanece en `waiting_municipal_results`.
5. Cuando todos los municipios requeridos están cerrados, el sistema agrupa clasificados.
6. El sistema valida duplicidad de selecciones.

### Validaciones

- Solo deben considerarse municipios cerrados.
- Cada municipio debe aportar campeón y subcampeón.
- No debe generarse bracket regional si existen duplicidades pendientes.

### Salida

Clasificados regionales listos para validación.

---

## 13. Flujo 08 — Resolución regional de selecciones repetidas

### Actor principal

Operador regional.

### Objetivo

Resolver casos donde dos o más clasificados de una misma región llegan con la misma selección.

### Entradas

- Lista de clasificados regionales.
- Selecciones asignadas.
- Estado regional `pending_duplicate_resolution`.

### Proceso

1. El sistema agrupa clasificados por selección.
2. El sistema detecta selecciones repetidas.
3. El sistema muestra cada conflicto.
4. Se aplica prioridad:
   - Campeón municipal conserva sobre subcampeón municipal.
   - Si ambos tienen el mismo rango, se hace sorteo público para definir quién conserva.
5. El jugador que no conserva entra a ruleta secundaria.
6. El sistema filtra selecciones disponibles.
7. El operador ejecuta la ruleta de reasignación.
8. El sistema guarda la nueva selección.
9. El sistema registra auditoría de reasignación.
10. El proceso se repite hasta eliminar duplicidades.

### Validaciones

- La nueva selección no puede estar bloqueada por otro clasificado.
- La nueva selección no puede ser la misma que generó el conflicto.
- Toda reasignación debe quedar auditada.
- No puede generarse bracket regional con duplicidades activas.

### Salida

Clasificados regionales sin selecciones repetidas.

---

## 14. Flujo 09 — Generación y operación de bracket regional

### Actor principal

Operador regional.

### Objetivo

Ejecutar la fase regional mediante eliminación directa.

### Entradas

- Clasificados regionales validados.
- Región sin duplicidades pendientes.

### Proceso

1. El operador regional presiona `Generar bracket regional`.
2. El sistema genera la llave regional.
3. El operador registra marcadores por partido.
4. El sistema avanza ganadores automáticamente.
5. Al cerrar la final regional:
   - Ganador = campeón regional.
   - Perdedor = subcampeón regional.
6. El sistema registra ambos como finalistas estatales.
7. El estado regional cambia a `completed`.

### Validaciones

- No puede iniciar bracket regional con municipios pendientes.
- No puede iniciar bracket regional con selecciones duplicadas.
- No puede cerrar fase regional con partidos pendientes.
- No puede cerrar fase regional sin campeón y subcampeón.

### Salida

Campeón y subcampeón regional registrados.

---

## 15. Flujo 10 — Consolidación estatal

### Actor principal

Comité estatal.

### Objetivo

Preparar la final estatal con los clasificados regionales.

### Entradas

- Campeones regionales.
- Subcampeones regionales.
- Regiones cerradas.

### Proceso

1. El comité estatal abre el dashboard estatal.
2. El sistema lista todas las regiones.
3. El sistema valida si todas las regiones requeridas están cerradas.
4. El sistema agrupa finalistas estatales.
5. El sistema detecta duplicidades de selección.
6. Si existen duplicidades, se ejecuta resolución estatal.
7. Si no existen duplicidades, la final queda lista para bracket.

### Validaciones

- No se puede generar final estatal si faltan regiones.
- No se puede generar final estatal si hay duplicidades pendientes.
- Cada región debe aportar campeón y subcampeón.

### Salida

Finalistas estatales listos.

---

## 16. Flujo 11 — Resolución estatal de selecciones repetidas

### Actor principal

Comité estatal.

### Objetivo

Resolver duplicidades de selección entre finalistas estatales.

### Entradas

- Finalistas estatales.
- Selecciones asignadas.

### Proceso

1. El sistema detecta selecciones repetidas entre finalistas.
2. El comité revisa cada conflicto.
3. Se aplica prioridad:
   - Campeón regional conserva sobre subcampeón regional.
   - Si ambos tienen el mismo rango, se hace sorteo público.
4. El finalista afectado gira ruleta secundaria.
5. El sistema guarda la nueva selección.
6. El sistema registra auditoría.
7. El proceso se repite hasta eliminar duplicidades.

### Salida

Finalistas estatales sin selección repetida.

---

## 17. Flujo 12 — Final estatal

### Actor principal

Comité estatal.

### Objetivo

Ejecutar la final estatal y determinar campeón del torneo.

### Entradas

- Finalistas estatales validados.
- Selecciones sin duplicidad.

### Proceso

1. El comité genera el bracket estatal.
2. El sistema muestra partidos listos.
3. El comité captura marcador de cada partido.
4. El sistema avanza ganadores.
5. Al cerrar la final, el sistema identifica campeón estatal.
6. El comité confirma cierre del torneo.
7. El torneo queda en estado finalizado.

### Validaciones

- No puede iniciar sin finalistas completos.
- No puede iniciar con duplicidades pendientes.
- No puede cerrarse con partidos pendientes.
- No puede cerrarse sin campeón estatal.

### Salida

Campeón estatal definido y torneo cerrado.

---

## 18. Flujo 13 — Corrección de marcador

### Actor principal

Comité estatal.

### Actor secundario

Operador autorizado.

### Objetivo

Corregir un marcador capturado incorrectamente.

### Entradas

- Partido cerrado.
- Motivo de corrección.
- Nuevo marcador.

### Proceso

1. El usuario autorizado selecciona un partido cerrado.
2. El sistema muestra el resultado actual.
3. El usuario presiona `Solicitar corrección`.
4. El sistema solicita motivo obligatorio.
5. El usuario captura el nuevo marcador.
6. El sistema recalcula ganador.
7. Si el ganador no cambia, el sistema actualiza el marcador.
8. Si el ganador cambia y afecta partidos posteriores, el sistema bloquea la corrección automática.
9. El sistema registra auditoría.

### Validaciones

- El motivo es obligatorio.
- No se permiten marcadores inválidos.
- Si la corrección cambia el ganador y ya existen partidos posteriores jugados, requiere reapertura administrativa de fase.
- Toda corrección debe auditarse.

### Salida

Marcador corregido o solicitud bloqueada para revisión administrativa.

---

## 19. Flujo 14 — Reapertura de fase

### Actor principal

Comité estatal.

### Objetivo

Permitir correcciones mayores cuando un error operativo afecta el avance del torneo.

### Entradas

- Fase cerrada o bloqueada.
- Motivo de reapertura.
- Usuario autorizado.

### Proceso

1. El comité selecciona la fase.
2. El sistema muestra advertencia de impacto.
3. El comité captura motivo obligatorio.
4. El sistema cambia la fase a estado editable controlado.
5. Se realizan correcciones necesarias.
6. El sistema registra auditoría.
7. El comité vuelve a cerrar la fase.

### Validaciones

- Solo comité estatal puede reabrir fases.
- Toda reapertura requiere motivo.
- La reapertura debe quedar registrada.
- No debe eliminarse historial anterior.

### Salida

Fase corregida y nuevamente cerrada.

---

## 20. Flujo 15 — Exportación de resultados

### Actor principal

Operador autorizado.

### Objetivo

Permitir descarga de resultados para respaldo, revisión o entrega institucional.

### Entradas

- Municipio, región, fase o torneo completo.
- Formato de exportación.

### Proceso

1. El usuario selecciona alcance de exportación.
2. El usuario elige formato:
   - CSV.
   - JSON.
3. El sistema genera archivo.
4. El usuario descarga archivo.

### Exportaciones mínimas

- Participantes municipales.
- Asignaciones de selecciones.
- Bracket municipal.
- Marcadores municipales.
- Clasificados regionales.
- Reasignaciones por duplicidad.
- Resultados regionales.
- Finalistas estatales.
- Resultado final estatal.

### Validaciones

- No exportar información incompleta sin marcarla como parcial.
- El archivo debe incluir fecha y fase.
- El archivo debe incluir municipio o región cuando aplique.

---

## 21. Flujo 16 — Modo de visualización pública

### Actor principal

Público.

### Objetivo

Mostrar información del torneo sin exponer controles administrativos.

### Pantallas públicas

- Ruleta municipal.
- Tablero de asignaciones.
- Bracket municipal.
- Bracket regional.
- Bracket estatal.
- Dashboard general de avance.

### Reglas

- No mostrar botones administrativos.
- No permitir edición desde modo público.
- Priorizar legibilidad en pantalla grande.
- Mantener datos sincronizados con el estado oficial.

---

## 22. Reglas transversales de operación

### 22.1 Bloqueo de edición

Una fase cerrada no debe editarse directamente.

Toda modificación posterior debe pasar por flujo de corrección o reapertura.

### 22.2 Auditoría

Deben auditarse:

- Inicio de sorteo.
- Asignación de selección.
- Generación de bracket.
- Captura de marcador.
- Corrección de marcador.
- Reasignación de selección.
- Cierre de fase.
- Reapertura de fase.

### 22.3 Sincronización

Si la plataforma opera con conexión inestable:

- Los datos pueden guardarse localmente de forma temporal.
- Los cambios deben marcarse como `pending_sync`.
- No se debe permitir cerrar una fase con cambios pendientes.

### 22.4 Control de duplicidades

Las selecciones no se repiten dentro de una eliminatoria municipal.

Las selecciones sí pueden repetirse entre municipios, pero deben resolverse antes de iniciar fase regional.

---

## 23. Criterios de aceptación del documento

Los flujos se consideran correctamente implementados cuando:

- Un municipio puede registrar entre 8 y 32 participantes.
- El sorteo asigna selecciones sin repetición municipal.
- El bracket municipal se genera después del sorteo.
- Los marcadores permiten definir ganadores.
- El sistema obtiene campeón y subcampeón municipal automáticamente.
- La región consolida clasificados municipales.
- El sistema detecta selecciones repetidas entre clasificados.
- La reasignación se registra con auditoría.
- La fase regional produce campeón y subcampeón regional.
- La final estatal produce campeón estatal.
- Las correcciones quedan auditadas.
- Los resultados pueden exportarse.
