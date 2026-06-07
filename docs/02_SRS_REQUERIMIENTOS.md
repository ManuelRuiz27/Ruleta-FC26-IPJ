# SRS — Requerimientos del Sistema

## 1. Requerimientos funcionales

### RF-01 — Selección de municipio

El sistema debe permitir seleccionar el municipio donde se realizará la eliminatoria.

Cada municipio pertenece a una región.

### RF-02 — Registro de participantes

El operador municipal debe poder registrar participantes.

Reglas:

- Mínimo oficial: 8 participantes.
- Máximo oficial: 32 participantes.
- No se permiten nombres vacíos.
- No se permiten nombres duplicados dentro del mismo municipio.

### RF-03 — Inicio de sorteo

El operador podrá iniciar el sorteo únicamente si:

- El municipio está seleccionado.
- Hay entre 8 y 32 participantes.
- El catálogo de selecciones está cargado.
- No existe una sesión activa duplicada para el mismo municipio.

### RF-04 — Orden aleatorio de participantes

Antes de iniciar el sorteo, el sistema debe ordenar aleatoriamente a los participantes.

El orden queda bloqueado al iniciar la sesión.

### RF-05 — Ruleta de selecciones

El sistema debe mostrar una ruleta visual con las selecciones disponibles.

Cada giro debe:

- Durar mínimo 1.8 segundos.
- Dar al menos 1.5 vueltas.
- Bloquear el botón mientras gira.
- Asignar una selección disponible.
- Guardar la asignación en base de datos.
- Actualizar el dashboard.

### RF-06 — No repetición municipal

Dentro de una misma sesión municipal, una selección no puede asignarse a más de un participante.

### RF-07 — Dashboard municipal

El sistema debe mostrar:

- Participantes registrados.
- Selección asignada.
- Estado del sorteo.
- Bracket municipal.
- Partidos pendientes.
- Partidos completados.
- Campeón y subcampeón.

### RF-08 — Generación de bracket

Al terminar el sorteo, el sistema debe generar un bracket de eliminación directa.

Debe soportar entre 8 y 32 jugadores.

Si el número de participantes no es potencia de 2, el sistema debe asignar byes.

### RF-09 — Captura de marcador

El operador debe poder capturar el marcador final de cada partido.

Campos mínimos:

- Goles jugador A.
- Goles jugador B.
- Si hubo tiempos extra.
- Si hubo penales.
- Marcador de penales, si aplica.
- Ganador.

### RF-10 — Avance automático

Al cerrar un partido, el sistema debe avanzar automáticamente al ganador a la siguiente ronda.

### RF-11 — Campeón y subcampeón municipal

Al cerrar la final municipal:

- Ganador = campeón municipal.
- Perdedor = subcampeón municipal.

Ambos pasan a fase regional.

### RF-12 — Dashboard regional

El sistema debe agrupar clasificados por región.

Debe mostrar:

- Municipio.
- Campeón municipal.
- Subcampeón municipal.
- Selección asignada.
- Estado de duplicidades.
- Bracket regional.

### RF-13 — Resolución de selecciones repetidas

Si dos clasificados llegan con la misma selección:

1. Campeón municipal conserva selección sobre subcampeón.
2. Si ambos tienen el mismo rango, se sortea quién conserva.
3. El jugador afectado gira una ruleta secundaria.
4. La nueva selección queda registrada como reasignación.

### RF-14 — Fase regional

El sistema debe permitir registrar partidos regionales bajo eliminación directa.

El campeón y subcampeón regional avanzan a la final estatal.

### RF-15 — Final estatal

El sistema debe mostrar los clasificados regionales y permitir registrar los partidos de la final estatal hasta determinar campeón estatal.

### RF-16 — Exportación

El sistema debe permitir exportar resultados en:

- CSV.
- JSON.

## 2. Requerimientos no funcionales

### RNF-01 — Plataforma web

La solución debe funcionar desde navegador moderno.

### RNF-02 — Pantalla pública

La interfaz debe verse correctamente en laptop conectada a proyector o pantalla.

### RNF-03 — Persistencia central

Los datos deben guardarse en Supabase.

### RNF-04 — Realtime

Los dashboards deben actualizarse en tiempo real o casi real cuando existan cambios relevantes.

### RNF-05 — Simplicidad operativa

El sistema debe poder ser operado por personal no técnico.

### RNF-06 — Auditoría mínima

Toda corrección de marcador o reasignación debe registrarse con:

- Usuario.
- Fecha.
- Valor anterior.
- Valor nuevo.
- Motivo.