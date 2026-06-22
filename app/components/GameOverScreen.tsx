'use client';

import { useEffect, useRef } from 'react';

type Props = {
  score: number;
  highScore: number;
  previousHighScore: number;
  onRestart: () => void;
  onBackToStart: () => void;
};

export default function GameOverScreen({
  score,
  highScore,
  previousHighScore,
  onRestart,
  onBackToStart,
}: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const primaryRef = useRef<HTMLButtonElement | null>(null);
  const titleId = 'game-over-title';

  // Marcar el resto de la página como inert mientras el diálogo está abierto,
  // para que lectores de pantalla no escapen del modal.
  useEffect(() => {
    const main = document.querySelector('main');
    const header = document.querySelector('header');
    const prevMainInert = main?.hasAttribute('inert') ?? false;
    const prevHeaderInert = header?.hasAttribute('inert') ?? false;
    main?.setAttribute('inert', '');
    header?.setAttribute('inert', '');
    return () => {
      if (!prevMainInert) main?.removeAttribute('inert');
      if (!prevHeaderInert) header?.removeAttribute('inert');
    };
  }, []);

  // Foco inicial en la acción principal
  useEffect(() => {
    primaryRef.current?.focus();
  }, []);

  // Trampa de foco dentro del diálogo hasta elegir una acción
  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;

    const focusable = () =>
      Array.from(
        node.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute('disabled'));

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const isNewRecord = score > previousHighScore && score > 0;
  const hadPreviousRecord = previousHighScore > 0;

  return (
    <div className="dialog-overlay">
      <div
        ref={dialogRef}
        className="card stack fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{ maxWidth: '520px', width: '100%' }}
      >
        <h1 id={titleId} className="title">
          ¡Game over!
        </h1>

        <p className="subtitle">
          {isNewRecord
            ? `¡Nuevo récord! Has conseguido ${score} puntos.`
            : `Has conseguido ${score} puntos. Inténtalo de nuevo.`}
        </p>

        <div
          className="cluster"
          style={{ gap: 'var(--sp-4)', justifyContent: 'center' }}
        >
          <div className="kpi" style={{ minWidth: '120px' }}>
            <span className="label">Puntos</span>
            <span className="value" aria-label={`Puntos: ${score}`}>
              {score}
            </span>
          </div>
          <div className="kpi" style={{ minWidth: '160px' }}>
            <span className="label">Mejor puntuación</span>
            <span
              className="value"
              aria-label={`Mejor puntuación: ${highScore}`}
            >
              {highScore > 0 ? highScore : '—'}
            </span>
          </div>
        </div>

        {/* Microcopy centrado: vive en el .stack principal para alinearse con el resto */}
        <div className="text-center">
          {isNewRecord && (
            <span className="badge badge-ok">¡Nueva mejor puntuación!</span>
          )}

          {isNewRecord && hadPreviousRecord && (
            <p className="text-sm muted" style={{ marginTop: 'var(--sp-2)' }}>
              Tu récord anterior era {previousHighScore}.
            </p>
          )}

          {!hadPreviousRecord && (
            <p className="text-sm muted" style={{ marginTop: 'var(--sp-2)' }}>
              Esta es tu primera partida. ¡Buen comienzo!
            </p>
          )}
        </div>

        {/* Botones: btn-block en móvil (apilados a ancho completo), lado a lado en desktop vía .cluster */}
        <div
          className="cluster"
          style={{ gap: 'var(--sp-3)', justifyContent: 'center' }}
        >
          <button
            ref={primaryRef}
            type="button"
            className="btn btn-primary btn-block"
            onClick={onRestart}
          >
            Volver a jugar
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-block"
            onClick={onBackToStart}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}