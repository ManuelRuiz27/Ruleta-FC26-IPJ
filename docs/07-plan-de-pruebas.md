# 07 — Plan de Pruebas

## Proyecto

Mundial FC 26 — Plataforma de Sorteo y Seguimiento

## Propósito

Definir el plan mínimo de pruebas para validar que la plataforma opera correctamente desde la etapa municipal hasta la final estatal.

Este documento cubre pruebas funcionales, validaciones de reglas de negocio, pruebas de flujo, pruebas de datos, pruebas visuales y criterios de aceptación para liberar el MVP.

---

## 1. Alcance de pruebas

### Incluido

- Registro de municipios y regiones.
- Registro de participantes.
- Validación de mínimo y máximo de jugadores.
- Sorteo de selecciones mediante ruleta.
- Asignación única de selección por sesión.
- Generación de bracket municipal.
- Captura de marcadores.
- Definición de ganador por tiempo regular, tiempo extra o penales.
- Avance automático de ganadores.
- Clasificación de campeón y subcampeón municipal.
- Consolidación regional.
- Detección y resolución de selecciones repetidas.
- Bracket regional.
- Final estatal.
- Dashboards municipal, regional y estatal.
- Realtime básico.
- Exportación CSV / JSON.
- Permisos mínimos por rol.
- Auditoría de correcciones.

### Excluido

- Marcador en vivo.
- Cronómetro de partido.
- Estadísticas avanzadas.
- Streaming.
- Pruebas de carga masiva pública.
- App móvil nativa.
- Integración con sistemas externos.

---

## 2. Fuente de verdad para validaciones

Las pruebas deben respetar las reglas establecidas en la convocatoria oficial y en la documentación funcional del proyecto.

Reglas críticas:

- Eliminatoria municipal con mínimo 8 participantes.
- Eliminatoria municipal con máximo 32 participantes.
- Formato de eliminación directa.
- Clasifican campeón y subcampeón municipal.
- En empate se define por tiempos extra y penales.
- Campeón y subcampeón regional avanzan a la final estatal.
- La selección asignada por ruleta no se repite dentro de una misma sesión municipal.
- Las selecciones repetidas entre clasificados se resuelven antes de iniciar la fase correspondiente.

---

## 3. Ambientes de prueba

| Ambiente | Uso | Datos |
|---|---|---|
| Local | Desarrollo y pruebas rápidas | Datos semilla locales |
| Staging | Validación previa a liberación | Datos similares al torneo real |
| Producción | Operación oficial | Datos reales |

Para MVP, staging puede vivir en el mismo proveedor gratuito, siempre que use proyecto Supabase separado o tablas claramente aisladas.

---

## 4. Roles a validar

| Rol | Permisos esperados |
|---|---|
| Operador municipal | Crear sesión municipal, registrar participantes, sortear, capturar marcadores municipales |
| Operador regional | Ver clasificados de su región, resolver duplicados, capturar fase regional |
| Comité estatal | Ver y administrar todo el torneo |
| Público | Solo lectura en vistas públicas |

---

## 5. Datos mínimos de prueba

### 5.1 Municipios

Usar al menos:

- Tamazunchale
- Xilitla
- Axtla
- Ciudad Valles
- Rioverde
- Matehuala
- San Luis Potosí Capital

### 5.2 Participantes

Crear datasets con:

| Dataset | Cantidad | Objetivo |
|---|---:|---|
| DS-01 | 7 | Validar bloqueo por mínimo insuficiente |
| DS-02 | 8 | Validar mínimo oficial |
| DS-03 | 12 | Validar bracket con byes |
| DS-04 | 16 | Validar bracket exacto |
| DS-05 | 24 | Validar bracket con byes en 32 |
| DS-06 | 32 | Validar máximo oficial |
| DS-07 | 33 | Validar bloqueo por exceso |

### 5.3 Selecciones

El catálogo debe contener exactamente 32 selecciones activas.

Casos inválidos:

- 31 selecciones activas.
- 33 selecciones activas.
- Selección duplicada.
- Selección sin bandera.
- Selección inactiva asignable por error.

---

## 6. Pruebas funcionales

## 6.1 Registro de participantes

| ID | Caso | Pasos | Resultado esperado |
|---|---|---|---|
| QA-001 | Crear participante válido | Capturar nombre y guardar | Participante registrado |
| QA-002 | Nombre vacío | Intentar guardar participante sin nombre | Sistema bloquea registro |
| QA-003 | Nombre duplicado | Registrar dos participantes con mismo nombre | Sistema bloquea o solicita diferenciador |
| QA-004 | Menos de 8 participantes | Intentar iniciar sorteo con 7 | Sistema bloquea inicio |
| QA-005 | Exactamente 8 participantes | Iniciar sorteo con 8 | Sistema permite continuar |
| QA-006 | Exactamente 32 participantes | Iniciar sorteo con 32 | Sistema permite continuar |
| QA-007 | Más de 32 participantes | Intentar registrar participante 33 | Sistema bloquea registro |
| QA-008 | Editar antes de iniciar | Editar nombre en estado draft | Cambio guardado |
| QA-009 | Editar después de iniciar | Intentar editar en sorteo activo | Sistema bloquea edición |

---

## 6.2 Sorteo de selecciones

| ID | Caso | Pasos | Resultado esperado |
|---|---|---|---|
| QA-010 | Iniciar sorteo válido | Con participantes válidos, iniciar sorteo | Estado cambia a `drawing` |
| QA-011 | Aleatorizar orden | Iniciar sorteo | Participantes reciben orden aleatorio |
| QA-012 | Girar ruleta | Presionar botón de giro | La ruleta anima y asigna selección |
| QA-013 | Bloqueo durante giro | Presionar varias veces mientras gira | Solo se registra un resultado |
| QA-014 | Selección única | Sortear todos los participantes | Ninguna selección se repite en la sesión |
| QA-015 | Guardado inmediato | Asignar selección | Registro aparece en base de datos |
| QA-016 | Recargar navegador | Recargar después de asignar | Resultado persiste |
| QA-017 | Terminar sorteo | Asignar selección a todos | Estado cambia a `draw_completed` |
| QA-018 | Catálogo incompleto | Activar solo 31 selecciones | Sistema bloquea sorteo |
| QA-019 | Catálogo duplicado | Duplicar selección | Sistema bloquea sorteo |

---

## 6.3 Bracket municipal

| ID | Caso | Pasos | Resultado esperado |
|---|---|---|---|
| QA-020 | Generar bracket con 8 | Terminar sorteo con 8 participantes | Bracket de 8 sin byes |
| QA-021 | Generar bracket con 12 | Terminar sorteo con 12 participantes | Bracket de 16 con 4 byes |
| QA-022 | Generar bracket con 16 | Terminar sorteo con 16 participantes | Bracket de 16 sin byes |
| QA-023 | Generar bracket con 24 | Terminar sorteo con 24 participantes | Bracket de 32 con 8 byes |
| QA-024 | Generar bracket con 32 | Terminar sorteo con 32 participantes | Bracket completo de 32 |
| QA-025 | Regenerar bracket activo | Intentar regenerar después de primer partido | Sistema bloquea o exige permiso estatal |
| QA-026 | Byes | Revisar jugadores con bye | Avanzan automáticamente a siguiente ronda |

---

## 6.4 Captura de marcadores

| ID | Caso | Pasos | Resultado esperado |
|---|---|---|---|
| QA-027 | Marcador normal | Capturar 3-1 | Gana jugador con mayor score |
| QA-028 | Marcador empatado | Capturar 2-2 | Sistema exige definición |
| QA-029 | Tiempo extra con ganador | Capturar empate y resultado tras extra | Sistema permite cerrar con ganador |
| QA-030 | Penales | Capturar empate y penales 4-3 | Sistema permite cerrar |
| QA-031 | Penales empatados | Capturar penales 4-4 | Sistema bloquea cierre |
| QA-032 | Score negativo | Capturar -1 | Sistema bloquea |
| QA-033 | Ganador inválido | Seleccionar ganador que no pertenece al partido | Sistema bloquea |
| QA-034 | Cerrar partido | Capturar resultado válido | Partido queda `completed` |
| QA-035 | Avance automático | Cerrar partido | Ganador aparece en siguiente ronda |

---

## 6.5 Campeón y subcampeón municipal

| ID | Caso | Pasos | Resultado esperado |
|---|---|---|---|
| QA-036 | Final municipal | Cerrar partido final | Ganador queda como campeón |
| QA-037 | Subcampeón municipal | Cerrar partido final | Perdedor queda como subcampeón |
| QA-038 | Cierre municipal válido | Completar bracket | Municipio cambia a `completed` |
| QA-039 | Cierre incompleto | Intentar cerrar sin final | Sistema bloquea |
| QA-040 | Clasificados regionales | Cerrar municipio | Se crean campeón y subcampeón regionalizables |

---

## 6.6 Fase regional

| ID | Caso | Pasos | Resultado esperado |
|---|---|---|---|
| QA-041 | Región incompleta | Faltan municipios por cerrar | Sistema mantiene región en espera |
| QA-042 | Región completa | Todos los municipios cerrados | Sistema permite validar clasificados |
| QA-043 | Duplicado de selección | Dos clasificados con misma selección | Sistema detecta duplicidad |
| QA-044 | Sin duplicados | Clasificados sin repetición | Sistema permite generar bracket |
| QA-045 | Campeón vs subcampeón | Ambos tienen misma selección | Campeón conserva |
| QA-046 | Mismo rango | Dos campeones con misma selección | Sistema exige sorteo para conservar |
| QA-047 | Reasignación | Afectado gira ruleta secundaria | Recibe selección disponible |
| QA-048 | Auditoría de reasignación | Reasignar selección | Sistema guarda historial |
| QA-049 | Bracket regional | Duplicados resueltos | Sistema genera bracket regional |
| QA-050 | Cierre regional | Completar bracket | Campeón y subcampeón regional definidos |

---

## 6.7 Final estatal

| ID | Caso | Pasos | Resultado esperado |
|---|---|---|---|
| QA-051 | Espera de regiones | Faltan regiones por cerrar | Final estatal no inicia |
| QA-052 | Consolidación estatal | Todas las regiones cerradas | Sistema lista finalistas |
| QA-053 | Duplicados estatales | Dos finalistas con misma selección | Sistema exige resolución |
| QA-054 | Bracket estatal | Finalistas validados | Sistema genera bracket |
| QA-055 | Campeón estatal | Completar final | Sistema define campeón estatal |
| QA-056 | Cierre del torneo | Cerrar final estatal | Torneo queda bloqueado |

---

## 7. Pruebas de permisos

| ID | Caso | Pasos | Resultado esperado |
|---|---|---|---|
| QA-057 | Operador municipal accede a su municipio | Iniciar sesión como operador municipal | Solo ve su municipio |
| QA-058 | Operador municipal intenta editar otro municipio | Acceder a municipio ajeno | Acceso denegado |
| QA-059 | Operador regional accede a su región | Iniciar como operador regional | Solo ve su región |
| QA-060 | Comité estatal | Iniciar como comité | Ve todo el torneo |
| QA-061 | Público | Abrir vista pública | Sin controles de edición |
| QA-062 | Acción sin sesión | Intentar guardar sin autenticación | Sistema bloquea |

---

## 8. Pruebas de realtime

| ID | Caso | Pasos | Resultado esperado |
|---|---|---|---|
| QA-063 | Dashboard municipal | Asignar selección | Dashboard actualiza sin recargar |
| QA-064 | Dashboard estatal | Cerrar municipio | KPI estatal se actualiza |
| QA-065 | Regional | Resolver duplicado | Estado regional se actualiza |
| QA-066 | Múltiples pantallas | Abrir dashboard en dos navegadores | Ambos reflejan cambios |
| QA-067 | Desconexión | Cortar internet durante operación | Sistema muestra alerta |

---

## 9. Pruebas de exportación

| ID | Caso | Pasos | Resultado esperado |
|---|---|---|---|
| QA-068 | Exportar CSV municipal | Cerrar municipio y exportar | Archivo contiene participantes, selecciones y resultados |
| QA-069 | Exportar JSON municipal | Exportar JSON | Archivo válido y reimportable |
| QA-070 | Exportar regional | Cerrar región y exportar | Archivo contiene clasificados y resultados |
| QA-071 | Exportar estatal | Cerrar torneo | Archivo contiene campeón estatal |
| QA-072 | Exportar auditoría | Generar archivo de auditoría | Incluye correcciones y reasignaciones |

---

## 10. Pruebas visuales y UX

| ID | Caso | Pasos | Resultado esperado |
|---|---|---|---|
| QA-073 | Vista en laptop | Abrir app en 1366x768 | No hay elementos cortados críticos |
| QA-074 | Vista en proyector 16:9 | Usar pantalla completa | Ruleta y tablero legibles |
| QA-075 | Contraste | Revisar textos principales | Lectura clara en fondo oscuro |
| QA-076 | Botón principal | Pantalla de ruleta | `Girar ruleta` es el CTA dominante |
| QA-077 | Animación | Girar ruleta | Animación fluida y sin bloqueo visual |
| QA-078 | Estado vacío | Abrir dashboard sin datos | Mensaje claro y sin errores |
| QA-079 | Error operativo | Provocar validación | Mensaje claro y accionable |

---

## 11. Pruebas de auditoría

| ID | Caso | Pasos | Resultado esperado |
|---|---|---|---|
| QA-080 | Corrección de marcador | Corregir partido cerrado | Se exige motivo |
| QA-081 | Historial de corrección | Guardar corrección | Se registra antes/después |
| QA-082 | Reasignación de selección | Resolver duplicado | Se registra selección anterior/nueva |
| QA-083 | Reapertura de fase | Comité reabre municipio | Se registra auditoría |
| QA-084 | Cierre de fase | Cerrar municipio/región/torneo | Se registra evento |

---

## 12. Pruebas de integridad de datos

| ID | Caso | Validación |
|---|---|---|
| QA-085 | Selección única municipal | No debe existir duplicado `(draw_session_id, team_id)` |
| QA-086 | Un participante una selección | No debe existir más de una asignación activa por participante |
| QA-087 | Partido con ganador válido | `winner_id` debe ser `player_a_id` o `player_b_id` |
| QA-088 | Municipio cerrado | Debe tener campeón y subcampeón |
| QA-089 | Región cerrada | Debe tener campeón y subcampeón regional |
| QA-090 | Final cerrada | Debe tener campeón estatal |
| QA-091 | Duplicados resueltos | No debe haber selecciones repetidas en bracket activo |
| QA-092 | Bracket consistente | Ganadores deben existir en ronda siguiente |

---

## 13. Smoke test mínimo antes de liberar

Este flujo debe pasar completo antes de publicar cambios.

1. Crear municipio de prueba.
2. Registrar 8 participantes.
3. Iniciar sorteo.
4. Asignar 8 selecciones.
5. Generar bracket.
6. Capturar todos los partidos.
7. Definir campeón y subcampeón.
8. Cerrar municipio.
9. Ver actualización en dashboard estatal.
10. Exportar CSV.
11. Exportar JSON.

Si falla cualquiera de estos pasos, no se libera.

---

## 14. Prueba E2E principal

## Caso E2E-01 — Torneo municipal completo

### Precondiciones

- Usuario operador municipal autenticado.
- Municipio en estado `draft`.
- Catálogo de 32 selecciones activo.

### Pasos

1. Registrar 8 participantes.
2. Confirmar lista.
3. Iniciar sorteo.
4. Girar ruleta para cada participante.
5. Validar que no se repitan selecciones.
6. Generar bracket.
7. Capturar resultados de semifinales y final.
8. Validar avance automático.
9. Cerrar eliminatoria.
10. Confirmar campeón y subcampeón.
11. Exportar resultados.

### Resultado esperado

- Eliminatoria en estado `completed`.
- Campeón y subcampeón generados automáticamente.
- Resultados visibles en dashboard estatal.
- Exportaciones correctas.

---

## 15. Criterios de salida QA

El MVP puede considerarse listo para piloto si cumple:

- 100% de smoke test aprobado.
- 100% de casos críticos aprobados.
- 0 defectos bloqueantes.
- 0 defectos críticos sin workaround.
- Exportación municipal validada.
- Dashboard estatal operativo.
- Realtime básico funcional.
- Permisos mínimos validados.
- Ruleta estable en pantalla pública.

---

## 16. Severidad de defectos

| Severidad | Descripción | Ejemplo |
|---|---|---|
| Bloqueante | Impide operar el torneo | No se puede guardar marcador |
| Crítica | Rompe regla oficial | Permite menos de 8 participantes |
| Alta | Afecta avance o datos | Ganador no avanza |
| Media | Afecta UX o corrección | Mensaje confuso |
| Baja | Detalle visual menor | Espaciado irregular |

---

## 17. Pendientes de validación manual

- Confirmar catálogo final de 32 selecciones.
- Confirmar regiones definitivas de municipios.
- Confirmar usuarios operadores por sede.
- Confirmar si el público verá solo ruleta o también bracket.
- Confirmar si exportación PDF será requerida en MVP.
- Confirmar si habrá modo demo separado del modo oficial.
