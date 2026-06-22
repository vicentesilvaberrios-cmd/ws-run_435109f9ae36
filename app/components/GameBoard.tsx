'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 16; // 16x16 celdas
const TICK_MS = 200;
const POINTS_PER_FOOD = 10;

const OPPOSITE: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

const DELTAS: Record<Direction, Point> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

function randomEmptyCell(snake: Point[]): Point {
  while (true) {
    const candidate = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    const collides = snake.some((s) => s.x === candidate.x && s.y === candidate.y);
    if (!collides) return candidate;
  }
}

function initialSnake(): Point[] {
  const cx = Math.floor(GRID_SIZE / 2);
  const cy = Math.floor(GRID_SIZE / 2);
  return [
    { x: cx, y: cy },
    { x: cx - 1, y: cy },
    { x: cx - 2, y: cy },
  ];
}

type Props = {
  onGameOver: (finalScore: number) => void;
  onScoreChange: (score: number) => void;
};

export default function GameBoard({ onGameOver, onScoreChange }: Props) {
  const [snake, setSnake] = useState<Point[]>(() => initialSnake());
  const [food, setFood] = useState<Point>(() => randomEmptyCell(initialSnake()));
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [pendingDirection, setPendingDirection] = useState<Direction>('RIGHT');
  const [paused, setPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [newRecord, setNewRecord] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const directionRef = useRef(direction);
  const pendingDirectionRef = useRef(pendingDirection);
  const pausedRef = useRef(paused);
  const scoreRef = useRef(score);
  const finishedRef = useRef(false);

  // Mantener refs sincronizadas para que el tick no vea valores stale
  useEffect(() => { directionRef.current = direction; }, [direction]);
  useEffect(() => { pendingDirectionRef.current = pendingDirection; }, [pendingDirection]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  // Notificar cambios de score al contenedor (padre)
  useEffect(() => {
    onScoreChange(score);
  }, [score, onScoreChange]);

  // Anuncios efímeros: limpiar después de 1s
  useEffect(() => {
    if (!feedback) return;
    const t = window.setTimeout(() => setFeedback(null), 1000);
    return () => window.clearTimeout(t);
  }, [feedback]);

  useEffect(() => {
    if (!newRecord) return;
    const t = window.setTimeout(() => setNewRecord(false), 2000);
    return () => window.clearTimeout(t);
  }, [newRecord]);

  const finishGame = useCallback(
    (finalScore: number) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      onGameOver(finalScore);
    },
    [onGameOver]
  );

  // Bucle principal del juego
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (pausedRef.current || finishedRef.current) return;

      setSnake((prevSnake) => {
        // Aplicar la dirección pendiente si es válida (no inversa a la actual)
        const currentDir = directionRef.current;
        const nextDir = pendingDirectionRef.current;
        const effectiveDir =
          OPPOSITE[currentDir] === nextDir ? currentDir : nextDir;

        directionRef.current = effectiveDir;
        setDirection(effectiveDir);

        const delta = DELTAS[effectiveDir];
        const head = prevSnake[0];
        const newHead: Point = { x: head.x + delta.x, y: head.y + delta.y };

        // Colisión con bordes
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          finishGame(scoreRef.current);
          return prevSnake;
        }

        // Colisión con cuerpo (excluyendo la cola, que se moverá)
        const willGrow = newHead.x === food.x && newHead.y === food.y;
        const bodyToCheck = willGrow ? prevSnake : prevSnake.slice(0, -1);
        if (bodyToCheck.some((seg) => seg.x === newHead.x && seg.y === newHead.y)) {
          finishGame(scoreRef.current);
          return prevSnake;
        }

        let nextSnake: Point[];
        if (willGrow) {
          nextSnake = [newHead, ...prevSnake];
          const newScore = scoreRef.current + POINTS_PER_FOOD;
          scoreRef.current = newScore;
          setScore(newScore);
          setFood(randomEmptyCell(nextSnake));
          setFeedback(`+${POINTS_PER_FOOD}`);
        } else {
          nextSnake = [newHead, ...prevSnake.slice(0, -1)];
        }

        return nextSnake;
      });
    }, TICK_MS);

    return () => window.clearInterval(interval);
  }, [food, finishGame]);

  const requestDirection = useCallback((next: Direction) => {
    if (finishedRef.current) return;
    // Anti-trampa: nunca invertir; se ignora silenciosamente
    if (OPPOSITE[directionRef.current] === next) return;
    pendingDirectionRef.current = next;
    setPendingDirection(next);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const key = event.key;
      const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      if (arrowKeys.includes(key)) event.preventDefault();

      switch (key) {
        case 'ArrowUp':
          requestDirection('UP');
          break;
        case 'ArrowDown':
          requestDirection('DOWN');
          break;
        case 'ArrowLeft':
          requestDirection('LEFT');
          break;
        case 'ArrowRight':
          requestDirection('RIGHT');
          break;
        case ' ':
          event.preventDefault();
          if (!finishedRef.current) setPaused((p) => !p);
          break;
        default:
          break;
      }
    },
    [requestDirection]
  );

  const handleExitToStart = useCallback(() => {
    // Abandono explícito: termina la partida con la puntuación actual
    finishGame(scoreRef.current);
  }, [finishGame]);

  // Construir celdas para render
  const cells = useMemo(() => {
    const grid: Array<'empty' | 'head' | 'body' | 'food'> = Array.from(
      { length: GRID_SIZE * GRID_SIZE },
      () => 'empty'
    );
    const idx = (x: number, y: number) => y * GRID_SIZE + x;
    snake.forEach((seg, i) => {
      const position = idx(seg.x, seg.y);
      grid[position] = i === 0 ? 'head' : 'body';
    });
    grid[idx(food.x, food.y)] = 'food';
    return grid;
  }, [snake, food]);

  const ariaLabel = `Tablero de Snake, serpiente de ${snake.length} segmentos, puntuación ${score}`;
  const pointsAnnouncement = feedback ? `${feedback} puntos.` : '';
  const recordAnnouncement = newRecord ? ' Nuevo récord.' : '';

  return (
    <div
      className="card stack"
      role="application"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ alignItems: 'center', ['--grid-size' as string]: GRID_SIZE } as React.CSSProperties}
    >
      <div
        className="game-board"
        aria-label="Tablero de juego"
      >
        {cells.map((cell, i) => {
          const isHead = cell === 'head';
          const isBody = cell === 'body';
          const isFood = cell === 'food';
          const isEmpty = cell === 'empty';
          const className = isHead
            ? 'cell cell-head'
            : isBody
            ? 'cell cell-body'
            : isFood
            ? 'cell cell-food'
            : 'cell';
          return (
            <div
              key={i}
              className={className}
              role={isEmpty ? 'presentation' : isFood ? 'img' : undefined}
              aria-label={
                isFood
                  ? 'Comida'
                  : isHead
                  ? 'Cabeza de la serpiente'
                  : undefined
              }
            />
          );
        })}

        {/* Feedback efímero "+10" */}
        {feedback && (
          <div
            className="float-up"
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              transform: 'translate(-50%, 0)',
              color: 'var(--ok)',
              fontWeight: 700,
              fontSize: 'var(--fs-xl)',
              pointerEvents: 'none',
            }}
          >
            {feedback}
          </div>
        )}

        {/* Overlay de pausa */}
        {paused && !finishedRef.current && (
          <div
            className="fade-in"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'var(--surface)',
              opacity: 0.92,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--sp-3)',
              borderRadius: 'var(--radius)',
              padding: 'var(--sp-4)',
              textAlign: 'center',
            }}
          >
            <h2 style={{ fontSize: 'var(--fs-2xl)' }}>Pausa</h2>
            <p className="muted">Pulsa espacio para continuar</p>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleExitToStart}
            >
              Volver al inicio
            </button>
          </div>
        )}
      </div>

      {/* Controles táctiles: solo en pantallas sin hover y pointer coarse (regla en globals.css) */}
      <div
        className="touch-controls"
        aria-label="Controles táctiles"
        style={{ display: 'none' }}
      >
        <span aria-hidden="true" className="touch-spacer" />
        <button type="button" className="btn btn-ghost" aria-label="Arriba" onClick={() => requestDirection('UP')}>↑</button>
        <span aria-hidden="true" className="touch-spacer" />
        <button type="button" className="btn btn-ghost" aria-label="Izquierda" onClick={() => requestDirection('LEFT')}>←</button>
        <button type="button" className="btn btn-ghost" aria-label="Abajo" onClick={() => requestDirection('DOWN')}>↓</button>
        <button type="button" className="btn btn-ghost" aria-label="Derecha" onClick={() => requestDirection('RIGHT')}>→</button>
      </div>

      <p className="text-sm muted">
        Flechas para mover · Espacio para pausar
      </p>

      {/* Anuncios separados para lectores de pantalla (evitar encadenamiento sin separación) */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {pointsAnnouncement}
      </div>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {recordAnnouncement}
      </div>

      {newRecord && (
        <span className="badge badge-ok fade-in" aria-hidden="true">
          ¡Nuevo récord!
        </span>
      )}
    </div>
  );
}