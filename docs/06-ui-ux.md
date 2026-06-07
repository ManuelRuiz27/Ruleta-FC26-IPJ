# 06 — UI/UX

## Proyecto

Mundial FC 26 — Plataforma de Sorteo y Seguimiento

## Propósito

Definir los lineamientos de experiencia de usuario, interfaz visual, navegación, componentes y comportamiento de pantallas para la plataforma.

Este documento debe guiar la implementación del frontend. No define base de datos, endpoints ni reglas internas de negocio.

---

## 1. Principio general de UX

La plataforma debe funcionar en dos contextos distintos:

1. **Operación pública:** pantallas visibles durante el sorteo y el torneo, pensadas para proyector, pantalla grande o monitor compartido.
2. **Operación administrativa:** pantallas para capturar participantes, marcadores, clasificados y seguimiento de fases.

La interfaz debe priorizar:

- Claridad visual.
- Pocas acciones por pantalla.
- Prevención de errores operativos.
- Lectura rápida a distancia.
- Estética sobria, tecnológica y presentable para público.

---

## 2. Fuente visual

La línea visual estará inspirada en `DESIGN.md`.

La estética base será:

- Fondo oscuro tipo blueprint.
- Superficies matte.
- Bordes finos.
- Glow azul sutil.
- Tipografía geométrica.
- Uso limitado de color saturado.
- Banderas como elemento visual principal.

No se deben usar fondos coloridos, degradados pesados, sombras decorativas excesivas ni tarjetas saturadas.

---

## 3. Tokens visuales

## 3.1 Colores

| Uso | Token | Valor |
|---|---|---|
| Fondo principal | `--color-bg` | `#05060f` |
| Superficie | `--color-surface` | `#2f343e` |
| Borde | `--color-border` | `#3f4959` |
| Texto principal | `--color-text` | `#c7d3ea` |
| Texto secundario | `--color-muted` | `#81899b` |
| Títulos | `--color-heading` | `#d8ecf8` |
| Acción primaria | `--color-primary` | `#663af3` |
| Acento frío | `--color-accent` | `#b6d9fc` |
| Éxito | `--color-success` | `#269684` |
| Advertencia | `--color-warning` | `#e46d4c` |
| Error | `--color-danger` | `#f04438` |

## 3.2 Tipografía

| Uso | Fuente recomendada | Fallback |
|---|---|---|
| UI general | Inter | system-ui |
| Títulos | Aeonik / Inter Display | Inter |
| Etiquetas técnicas | JetBrains Mono | monospace |

No se requiere incluir fuentes comerciales en el repositorio.

## 3.3 Radios

| Elemento | Radio |
|---|---:|
| Botones | 2px |
| Inputs | 2px |
| Badges | 6px |
| Cards | 10px a 16px |
| Pills | 999px |

## 3.4 Espaciado

Usar escala base de 4px.

| Token | Valor |
|---|---:|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |

---

## 4. Layout general

## 4.1 Shell administrativo

Usado para:

- Dashboard estatal.
- Dashboard regional.
- Configuración municipal.
- Captura de participantes.
- Captura de marcadores.

Estructura:

```txt
┌──────────────────────────────────────────────┐
│ Header: Torneo / Región / Usuario            │
├───────────────┬──────────────────────────────┤
│ Navegación    │ Contenido principal           │
│ lateral       │                              │
└───────────────┴──────────────────────────────┘
```

En móvil o tablet vertical, la navegación lateral puede convertirse en menú superior o drawer.

## 4.2 Shell público

Usado para:

- Ruleta.
- Tablero público.
- Bracket público.

Estructura:

```txt
┌──────────────────────────────────────────────┐
│ Mundial FC 26 · Municipio · Región           │
├──────────────────────────────────────────────┤
│ Contenido principal a pantalla completa       │
└──────────────────────────────────────────────┘
```

La pantalla pública debe evitar barras laterales pesadas.

---

## 5. Navegación principal

## 5.1 Menú administrativo estatal

Opciones:

- Dashboard estatal.
- Municipios.
- Regiones.
- Clasificados.
- Duplicidades.
- Final estatal.
- Auditoría.

## 5.2 Menú operador municipal

Opciones:

- Mi municipio.
- Participantes.
- Sorteo.
- Bracket.
- Marcadores.
- Cierre municipal.

## 5.3 Menú operador regional

Opciones:

- Mi región.
- Clasificados municipales.
- Duplicidades.
- Bracket regional.
- Marcadores.
- Cierre regional.

---

## 6. Pantallas requeridas

## 6.1 Login / acceso operador

## Objetivo

Permitir acceso básico a operadores municipales, regionales y comité estatal.

## Contenido

- Título del torneo.
- Campo de correo o usuario.
- Campo de contraseña o PIN.
- Botón principal: `Entrar`.
- Mensaje de error simple.

## Criterios UX

- No saturar con información del torneo.
- El botón principal debe ser único.
- Mostrar errores sin tecnicismos.

---

## 6.2 Dashboard estatal

## Objetivo

Dar visibilidad del avance general del torneo.

## Contenido mínimo

- Municipios completados / total.
- Participantes registrados.
- Partidos jugados.
- Regiones completadas.
- Duplicidades pendientes.
- Finalistas estatales.
- Estado por región.
- Estado por municipio.

## Layout sugerido

```txt
┌──────────────────────────────────────────────┐
│ Dashboard Estatal                             │
├──────────┬──────────┬──────────┬─────────────┤
│ KPI 1    │ KPI 2    │ KPI 3    │ KPI 4       │
├─────────────────────┬────────────────────────┤
│ Estado por región   │ Duplicidades pendientes │
├─────────────────────┴────────────────────────┤
│ Tabla de municipios                           │
└──────────────────────────────────────────────┘
```

## Criterios UX

- Usar KPIs grandes y legibles.
- Evitar gráficas innecesarias.
- Priorizar tablas y estados.
- Resaltar duplicidades o fases bloqueadas.

---

## 6.3 Configuración municipal

## Objetivo

Preparar una eliminatoria municipal.

## Contenido mínimo

- Municipio.
- Región.
- Fecha.
- Estado de eliminatoria.
- Lista de participantes.
- Botón: `Validar participantes`.
- Botón: `Iniciar sorteo`.

## Criterios UX

- El operador debe saber si aún puede editar.
- El estado debe mostrarse de forma visible.
- Si faltan participantes, mostrar contador.

Ejemplo:

```txt
Participantes: 6 / 8 mínimo
No se puede iniciar todavía.
```

---

## 6.4 Registro de participantes

## Objetivo

Capturar de forma rápida los jugadores del municipio.

## Contenido mínimo

Tabla editable:

| # | Nombre | Estado | Acción |
|---|---|---|---|
| 1 | — | Pendiente | Eliminar |

Acciones:

- Agregar participante.
- Pegar lista.
- Limpiar lista.
- Validar lista.

## Comportamiento recomendado

Debe permitirse pegar varios nombres desde Excel o texto plano.

Ejemplo:

```txt
Juan Pérez
Luis Torres
Carlos Hernández
```

El sistema debe convertir cada línea en un participante.

## Validaciones visibles

- Nombre vacío.
- Nombre duplicado.
- Menos de 8 participantes.
- Más de 32 participantes.

---

## 6.5 Pantalla pública de ruleta

## Objetivo

Realizar el sorteo de selecciones de manera visual y entendible para el público.

## Contenido mínimo

- Nombre del torneo.
- Municipio.
- Región.
- Participante actual.
- Ruleta de selecciones.
- Botón principal: `Girar ruleta`.
- Resultado del giro.
- Progreso del sorteo.
- Mini tabla de asignaciones.

## Layout sugerido

```txt
┌──────────────────────────────────────────────┐
│ Mundial FC 26 · Tamazunchale · Huasteca Sur  │
├────────────────────────────┬─────────────────┤
│                            │ Participantes   │
│          RULETA            │                 │
│                            │ Juan — México   │
│  Participante actual       │ Luis — Pendiente│
│  Carlos López              │ Ana — Pendiente │
│                            │                 │
│      [GIRAR RULETA]        │                 │
└────────────────────────────┴─────────────────┘
```

## Comportamiento

1. El sistema muestra al participante actual.
2. El operador o participante presiona `Girar ruleta`.
3. El botón se bloquea.
4. La ruleta gira mínimo 1.5 vueltas.
5. Se muestra resultado.
6. El dashboard se actualiza.
7. El sistema avanza al siguiente participante.

## Criterios visuales

- La ruleta debe ser el centro visual.
- Las banderas pueden ser coloridas.
- El resto de la UI debe mantenerse oscura y sobria.
- El resultado debe aparecer en una tarjeta grande.

Ejemplo:

```txt
Carlos López representará a Argentina
```

---

## 6.6 Tablero público de asignaciones

## Objetivo

Mostrar a todos los asistentes qué selección recibió cada participante.

## Contenido mínimo

| Turno | Participante | Selección | Estado |
|---|---|---|---|
| 1 | Carlos López | Argentina | Asignado |
| 2 | Luis Torres | — | Pendiente |

## Criterios UX

- Debe funcionar en pantalla completa.
- Debe ser legible desde distancia.
- No debe mostrar controles administrativos.

---

## 6.7 Bracket municipal

## Objetivo

Mostrar y administrar la eliminatoria directa municipal.

## Contenido mínimo

- Rondas.
- Partidos.
- Jugador A / selección A.
- Jugador B / selección B.
- Marcador.
- Ganador.
- Estado del partido.

## Vista pública

Solo lectura.

## Vista operador

Con botón para capturar marcador en partidos `ready`.

## Criterios UX

- Los partidos pendientes deben verse distintos a los completados.
- El ganador debe resaltarse.
- Los byes deben indicarse como avance automático.

---

## 6.8 Captura de marcador

## Objetivo

Registrar el resultado final de un partido.

## Contenido mínimo

- Jugador A y selección.
- Jugador B y selección.
- Marcador regular.
- Indicador de tiempos extra.
- Indicador de penales.
- Marcador de penales si aplica.
- Ganador.
- Botón: `Guardar resultado`.

## Comportamiento

- Si el marcador regular no está empatado, el sistema calcula ganador.
- Si el marcador regular está empatado, el sistema pide definición.
- Si hay penales, no permite empate en penales.
- No permite guardar sin ganador.

## Mensajes de validación

```txt
El partido está empatado. Captura definición por tiempos extra o penales.
```

```txt
El marcador de penales no puede terminar empatado.
```

---

## 6.9 Cierre municipal

## Objetivo

Cerrar oficialmente una eliminatoria municipal.

## Contenido mínimo

- Municipio.
- Campeón municipal.
- Subcampeón municipal.
- Selecciones correspondientes.
- Estado de sincronización.
- Botón: `Cerrar eliminatoria municipal`.

## Validaciones

- Todos los partidos deben estar completados.
- Debe existir campeón.
- Debe existir subcampeón.
- No debe haber datos pendientes de sincronizar.

---

## 6.10 Dashboard regional

## Objetivo

Controlar clasificados municipales por región.

## Contenido mínimo

- Municipios de la región.
- Estado de cada eliminatoria municipal.
- Campeón y subcampeón por municipio.
- Selección de cada clasificado.
- Duplicidades detectadas.
- Estado del bracket regional.

## Criterios UX

- Las duplicidades deben ser visibles sin buscar en tablas.
- Si falta cerrar un municipio, la fase regional debe verse bloqueada.

---

## 6.11 Resolución de duplicidades

## Objetivo

Resolver selecciones repetidas antes de iniciar fase regional o estatal.

## Contenido mínimo

- Selección duplicada.
- Jugadores involucrados.
- Rango de cada jugador: campeón o subcampeón.
- Jugador que conserva selección.
- Jugador que debe reasignar.
- Ruleta secundaria.
- Historial de reasignación.

## Comportamiento

- Si hay prioridad clara, el sistema propone quién conserva.
- Si no hay prioridad clara, se ejecuta sorteo para conservar selección.
- El afectado gira ruleta secundaria.
- Se guarda selección nueva.

---

## 6.12 Final estatal

## Objetivo

Mostrar y administrar la etapa final del torneo.

## Contenido mínimo

- Finalistas regionales.
- Bracket estatal.
- Marcadores.
- Campeón estatal.
- Estado general del torneo.

---

## 7. Componentes UI

## 7.1 Botón primario

Uso:

- Iniciar sorteo.
- Girar ruleta.
- Guardar resultado.
- Cerrar fase.

Reglas:

- Solo un botón primario dominante por pantalla.
- Color: `#663af3`.
- Radio: `2px`.

## 7.2 Botón secundario

Uso:

- Cancelar.
- Volver.
- Exportar.
- Ver detalle.

Estilo:

- Fondo transparente.
- Borde fino.
- Texto claro.

## 7.3 Cards de KPI

Uso:

- Dashboard estatal.
- Dashboard regional.
- Dashboard municipal.

Contenido:

- Etiqueta.
- Número principal.
- Estado o descripción corta.

## 7.4 Badges de estado

Estados mínimos:

| Estado | Uso |
|---|---|
| Pendiente | Gris |
| En curso | Azul frío |
| Completado | Verde |
| Bloqueado | Morado |
| Error | Rojo |
| Advertencia | Naranja |

## 7.5 Modal de confirmación

Usar para acciones destructivas o irreversibles:

- Cerrar eliminatoria.
- Corregir marcador.
- Reabrir fase.
- Regenerar bracket.

Debe incluir:

- Título claro.
- Consecuencia de la acción.
- Botón cancelar.
- Botón confirmar.

---

## 8. Estados de interfaz

## 8.1 Loading

Debe indicar carga sin bloquear visualmente toda la pantalla salvo que sea necesario.

## 8.2 Empty state

Ejemplo:

```txt
Aún no hay participantes registrados.
Agrega al menos 8 para iniciar la eliminatoria.
```

## 8.3 Error state

El error debe explicar acción correctiva.

Mal:

```txt
Error 400.
```

Correcto:

```txt
No se puede iniciar el sorteo: faltan al menos 2 participantes.
```

## 8.4 Offline / pending sync

Si la app pierde conexión:

- Mostrar indicador visible.
- Guardar localmente si aplica.
- Marcar cambios como pendientes.
- Bloquear cierre de fase hasta sincronizar.

Mensaje recomendado:

```txt
Sin conexión. Los cambios se guardaron en este dispositivo y deben sincronizarse antes de cerrar la fase.
```

---

## 9. Responsive

## 9.1 Desktop / laptop

Resolución objetivo:

- 1366x768.
- 1920x1080.

Uso principal:

- Operación administrativa.
- Pantalla pública.
- Proyector.

## 9.2 Tablet

Debe ser usable para:

- Captura de marcadores.
- Consulta de bracket.
- Dashboard regional.

## 9.3 Móvil

Solo debe cubrir consulta y operación básica.

No se recomienda operar la ruleta principal desde móvil durante evento público.

---

## 10. Accesibilidad mínima

La plataforma debe cumplir criterios básicos:

- Contraste suficiente en textos.
- Tamaño mínimo de texto de 14px.
- Botones con área clickeable suficiente.
- Estados no dependientes solo de color.
- Labels visibles en inputs.
- Navegación básica por teclado en formularios.

---

## 11. Reglas de microcopy

Los textos deben ser cortos y operativos.

Preferir:

```txt
Iniciar sorteo
Guardar resultado
Cerrar eliminatoria
Resolver duplicidad
```

Evitar:

```txt
Proceder con la inicialización formal del proceso de asignación
```

---

## 12. Criterios de aceptación UI/UX

- La pantalla de ruleta puede entenderse sin explicación previa.
- El operador puede registrar participantes sin capacitación técnica.
- El sistema impide iniciar con menos de 8 participantes.
- El botón principal de cada pantalla es evidente.
- Los errores indican qué debe corregirse.
- El dashboard estatal muestra el avance del torneo en menos de 10 segundos de revisión.
- La captura de marcador no permite cerrar empates sin definición.
- Las duplicidades de selección se detectan y resaltan visualmente.
- La pantalla pública funciona bien en 16:9.
- La interfaz mantiene consistencia visual con la estética definida.

---

## 13. Fuera de alcance UI para MVP

No se diseñará en MVP:

- App móvil nativa.
- Modo streaming.
- Animaciones 3D complejas.
- Estadísticas avanzadas de jugadores.
- Perfiles públicos de participantes.
- Personalización visual por municipio.
- Carga de fotografías de jugadores.

---

## 14. Pendientes de decisión

- Definir si el público podrá consultar resultados desde una URL pública.
- Definir si la ruleta tendrá sonido.
- Definir catálogo final de selecciones y assets de banderas.
- Definir si se permitirá modo demo con menos de 8 participantes.
- Definir si el diseño tendrá logotipos institucionales en header.
