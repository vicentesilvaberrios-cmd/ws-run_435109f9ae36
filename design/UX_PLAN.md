# Plan de UX — Snake Clásico

> App 100% cliente. Una sola ruta (`app/page.tsx`) que gestiona tres estados
> visuales: **inicio**, **juego** y **game over**. Sin jerga técnica en UI.
> Marca del proyecto: verde-azul (`--brand`) en cabecera y acciones principales.

---

## Convenciones globales (aplican a toda la app)

- **Idioma**: español, cercano al usuario. Nada de "CRUD", "endpoint", "submit", "id".
- **Layout base**: `.container` centrado, fondo `--bg`, tipografía sans del sistema.
- **Cabecera persistente** (`.navbar`) con título "Snake" a la izquierda y, a la
  derecha, el `.kpi` con la mejor puntuación (solo visible durante el juego).
- **Botones**: único patrón `.btn .btn-primary` para acción principal ("Jugar",
  "Volver a jugar"); `.btn .btn-ghost` para acciones secundarias.
- **Tarjeta central**: `.card` con `--shadow-sm` y `padding --sp-5` para agrupar
  cada uno de los tres estados.
- **Responsive**: mobile-first; tablero siempre cuadrado y centrado, escala fluida
  con `aspect-ratio` y `max-width`.
- **Accesibilidad**: foco visible heredado; cada botón con texto visible;
  mensajes de estado anunciados con `aria-live="polite"`; instrucciones disponibles
  por teclado.
- **Estados de UI**: como la app no carga datos remotos, no aplica cargando/ vacío/
  error tradicionales; sí contemplamos **estado inicial del marcador** ("Aún no
  has jugado") y mensaje de **récord batido** al superar la mejor puntuación.

---

## 1. Pantalla principal — `app/page.tsx`

**Objetivo**: ser el contenedor único que decide qué vista mostrar según el
estado del juego (`idle` | `playing` | `over`).

- **Layout**:
  - `<header class="navbar">` con logo/título "Snake" y `ScoreDisplay` (oculto
    en estado `idle`).
  - `<main class="container stack">` con la vista correspondiente.
- **Composición**:
  - Si `status === 'idle'` → `<StartScreen onStart={…} />`
  - Si `status === 'playing'` → `<GameBoard onGameOver={…} />` + `<ScoreDisplay />`
  - Si `status === 'over'` → `<GameOverScreen score={…} highScore={…} onRestart={…} />`
- **Responsive**: el `<main>` usa `.container`; en móvil todo a una columna, en
  desktop (≥960px) el tablero se centra con `max-width: 520px`.
- **Accesibilidad**: `<main>` con `role="main"`; cambios de estado anunciados en
  una región `aria-live="polite"` (`sr-only`) para que lectores de pantalla
  informen "Juego iniciado" / "Juego terminado".
- **Consistencia**: cualquier overlay (inicio, game over) usa `.card` para no
  romper el lenguaje visual entre estados.

---

## 2. `app/components/StartScreen.tsx` — Pantalla de inicio

**Objetivo**: bienvenida + instrucciones claras + llamada a la acción.

- **Layout**: `.card` centrada en `<main>`, con `.stack` interior.
  - `.title` con `<h1>` "Snake".
  - Subtítulo `.subtitle` "El clásico juego de la serpiente".
  - Bloque de instrucciones (`.panel`) con título `<h2>` "Cómo jugar".
- **Copy**:
  - **H1**: "Snake"
  - **Subtítulo**: "El clásico juego de la serpiente. ¡Come y crece sin chocarte!"
  - **Instrucciones** (lista con verbos del dominio):
    - "Usa las **flechas del teclado** para mover la serpiente."
    - "**Come** la comida para crecer y sumar puntos."
    - "**Evita** chocar con los bordes o con tu propio cuerpo."
  - **Texto secundario** (`.muted`): "Cada comida suma 10 puntos. Tu mejor
    puntuación se guarda en este navegador."
  - **CTA principal**: `.btn .btn-primary .btn-block` → **"Jugar"**.
  - **Microtexto bajo el botón** (`.text-sm .muted`): "Pulsa Jugar para empezar.
    Podrás pausar con la barra espaciadora."
- **Estados**:
  - Sin récord previo: badge neutro `.badge` "Aún no has jugado".
  - Con récord: `.badge .badge-info` con `aria-label` "Tu mejor puntuación es
    {n} puntos" → texto visible "Récord: {n} pts".
- **Responsive**: instrucciones en una columna siempre; botón a ancho completo
  en móvil, tamaño natural en desktop.
- **Accesibilidad**: botón "Jugar" como `<button>` con texto visible; instrucciones
  en `<ul>` semántica; foco inicial en el botón "Jugar".

---

## 3. `app/components/GameBoard.tsx` — Tablero de juego

**Objetivo**: el área de juego interactiva; única zona "viva" de la pantalla.

- **Layout**:
  - `.card` que contiene el tablero y un pie con microcopy de ayuda.
  - Tablero: `<canvas>` o `<grid>` con `aspect-ratio: 1 / 1`, `width: 100%`,
    `max-width: 480px`, `margin-inline: auto`, fondo `--surface-2`, borde
    `1px solid var(--border)`, `border-radius: var(--radius)`.
  - Pie: `.cluster` con `aria-live` para mensajes ("+10 puntos", "Nuevo récord").
- **Render del tablero** (clases utilitarias, sin estilos ad-hoc):
  - Celdas de la serpiente: `background: var(--brand)`, esquinas redondeadas
    suaves según dirección de la cabeza.
  - Cabeza: `var(--brand-hover)`.
  - Comida: `var(--danger)` (un círculo/celda diferenciada con `aria-label`).
  - Cuadrícula base: `--border` muy sutil para guiar la vista.
- **Copy en pantalla**:
  - **Pie del tablero** (`.text-sm .muted`): "Flechas para mover · Espacio
    para pausar".
  - **Mensaje de pausa** (overlay `.panel` centrado sobre el tablero):
    - H2 "Pausa" + texto "Pulsa espacio para continuar" + `.btn .btn-ghost`
      "Salir de la partida" (abandona la partida actual; el récord se
      conserva en `localStorage`).
- **Estados**:
  - **Pausa**: overlay translúcido sobre el tablero (no `.alert`; overlay a medida
    con `var(--surface)` + `opacity .9`).
  - **Comida comida**: mensaje breve "+10" que aparece y se desvanece (1s),
    anunciado por `aria-live="polite"`.
  - **Nuevo récord**: `.badge .badge-ok` temporal "¡Nuevo récord!" + texto
    "Has superado tu mejor puntuación".
- **Responsive**:
  - En móvil (<640px): tablero ocupa `width: 100%` hasta `min(480px, 92vw)`.
  - En desktop: tablero centrado, máximo 480px de lado.
  - Controles táctiles (opcional, fuera de alcance estricto pero recomendado):
    cuatro botones `.btn .btn-ghost` abajo (↑ ← ↓ →) visibles solo en pantallas
    sin teclado, vía `@media (hover: none)` y `(pointer: coarse)`.
- **Accesibilidad**:
  - Tablero con `role="application"` y `aria-label="Tablero de Snake, serpiente
    de {n} segmentos, puntuación {p}"`.
  - Dirección actual no comunicada solo por color: la cabeza se diferencia por
    tono **y** por tamaño/forma.
  - Captura de teclado a nivel del tablero (`tabIndex={0}`), sin atrapar el
    foco globalmente; `onKeyDown` evita `preventDefault` salvo en flechas.

---

## 4. `app/components/ScoreDisplay.tsx` — Marcador

**Objetivo**: mostrar puntuación actual y mejor puntuación de forma clara.

- **Layout**: `.cluster` con dos `.kpi` lado a lado, separados por `gap-4`.
  - **Variante en juego**: aparece en el `.navbar` (compacta) o bajo el tablero
    (amplia). Una sola variante por pantalla: **bajo el tablero** durante el
    juego, en `.cluster` horizontal.
  - **Variante compacta** (cabecera): dos mini-`.kpi` con `.value` más pequeño
    (`--fs-lg`) si el espacio es limitado.
- **Copy**:
  - **Etiqueta actual** (`.label`): "Puntos".
  - **Etiqueta mejor** (`.label`): "Mejor puntuación".
  - **Valor**: número grande en `.value`; al actualizar, micro-animación (no
    jerga técnica) de escala suave —puramente visual.
- **Estados**:
  - **Sin partidas previas**: valor del récord "—".
  - **Récord batido**: `.kpi .label` del actual cambia a `.badge .badge-ok`
    "¡Nuevo récord!" durante 2s.
- **Responsive**: en móvil las dos `.kpi` se apilan (`.cluster` permite wrap);
  en desktop quedan en la misma fila.
- **Accesibilidad**: contenedor con `aria-live="polite"` para que cambios de
  puntuación se anuncien; valores envueltos en `<span aria-label="Puntos:
  {n}">`.

---

## 5. `app/components/GameOverScreen.tsx` — Pantalla de fin de juego

**Objetivo**: cerrar la partida con feedback emocional y permitir reiniciar.

- **Layout**: `.card` centrada sobre fondo ligeramente atenuado (overlay simple
  con `position: fixed; inset: 0; background: rgba(0,0,0,.35)`).
  - `.stack` interior: título → resultado → botones.
- **Copy**:
  - **H1**: "¡Game over!"
  - **Subtítulo** (`.subtitle`): mensaje empático según el caso:
    - Si fue récord: "¡Nuevo récord! Has conseguido **{puntos} puntos**."
    - Si no: "Has conseguido **{puntos} puntos**. Inténtalo de nuevo."
  - **Bloque `.cluster` con dos `.kpi`**:
    - "Puntos" → `{puntos}`.
    - "Mejor puntuación" → `{highScore}` (con `.badge .badge-ok` "Récord" si
      coincide).
  - **Acciones** (`.cluster`):
    - `.btn .btn-primary` → **"Volver a jugar"**.
    - `.btn .btn-ghost` → **"Volver al inicio"**.
- **Estados**:
  - **Récord batido**: añadir línea celebrativa con `.badge .badge-ok`
    "¡Nueva mejor puntuación!" + texto "Tu récord anterior era {previo}".
  - **Sin récord previo**: texto neutro "Esta es tu primera partida. ¡Buen
    comienzo!"
- **Responsive**: botones a ancho completo en móvil (`btn-block`),
  lado a lado en desktop.
- **Accesibilidad**: foco inicial en "Volver a jugar"; overlay con
  `role="dialog"` y `aria-labelledby` apuntando al H1; trampa de foco dentro
  del diálogo hasta que se elija una acción.

---

## 6. Microcopy transversal (consistencia entre pantallas)

| Concepto | Texto visible |
|---|---|
| Acción principal de juego | **"Jugar"** / **"Volver a jugar"** |
| Salir al inicio | **"Volver al inicio"** |
| Pausa | **"Pausa"** (overlay) |
| Continuar | **"Continuar"** |
| Puntos por comida | **"+10"** |
| Récord batido | **"¡Nuevo récord!"** |
| Mejor puntuación | **"Mejor puntuación"** |
| Puntos actuales | **"Puntos"** |
| Sin partidas | **"Aún no has jugado"** |
| Guardado local | **"Se guarda en este navegador"** (solo informativo) |

---

## 7. Notas de implementación (UX, no código)

- **Persistencia**: `localStorage` se usa internamente para la mejor puntuación;
  el usuario **nunca** ve el término. Solo aparece el resultado ("Mejor
  puntuación: 80").
- **Anti-trampa de dirección**: si el usuario pulsa la dirección inversa justo
  antes de tick, se ignora silenciosamente (sin mensaje de error al usuario).
- **Feedback inmediato**: cada acción del jugador debe tener respuesta visual
  ≤200ms (movimiento de la serpiente); evitar estados "colgados" sin mensaje.
- **Modo oscuro**: soportado vía `prefers-color-scheme`; el tablero usa
  `--surface-2` para mantener contraste de la cuadrícula.
- **Pruebas de aceptación UX** (mapeo a la spec):
  - CA1–CA5 → verificables visualmente en `GameBoard` (movimiento, colisión,
    crecimiento).
  - CA6–CA8 → verificables en `ScoreDisplay` (puntos en vivo, mejor
    puntuación persistente).
  - CA9–CA11 → verificables en `StartScreen` y `GameOverScreen` (copy y CTAs).