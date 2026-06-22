'use client';

import { useEffect, useRef } from 'react';

type Props = {
  highScore: number;
  onStart: () => void;
};

export default function StartScreen({ highScore, onStart }: Props) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Foco inicial en el CTA principal. Se ejecuta una sola vez al montar;
  // si el padre re-monta este componente, queremos el mismo comportamiento
  // (foco en "Jugar"), por eso no añadimos guards adicionales.
  useEffect(() => {
    buttonRef.current?.focus();
    // Dependencia vacía intencional: solo al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasRecord = highScore > 0;

  return (
    <div className="card stack" style={{ maxWidth: '520px', marginInline: 'auto' }}>
      <div className="stack" style={{ marginTop: 0 }}>
        <h1 className="title">Snake</h1>
        <p className="subtitle">
          El clásico juego de la serpiente. ¡Come y crece sin chocarte!
        </p>
      </div>

      <section className="panel stack" aria-labelledby="how-to-title">
        <h2 id="how-to-title" style={{ fontSize: 'var(--fs-xl)' }}>
          Cómo jugar
        </h2>
        <ul className="stack list">
          <li>
            Usa las <strong>flechas del teclado</strong> para mover la serpiente.
          </li>
          <li>
            <strong>Come</strong> la comida para crecer y sumar puntos.
          </li>
          <li>
            <strong>Evita</strong> chocar con los bordes o con tu propio cuerpo.
          </li>
        </ul>
      </section>

      <p className="text-sm muted">
        Cada comida suma 10 puntos. Tu mejor puntuación se guarda en este navegador.
      </p>

      <div className="cluster" style={{ gap: 'var(--sp-2)' }}>
        {hasRecord ? (
          <span
            className="badge badge-info"
            aria-label={`Tu mejor puntuación es ${highScore} puntos`}
          >
            Récord: {highScore} pts
          </span>
        ) : (
          <span className="badge">Aún no has jugado</span>
        )}
      </div>

      <button
        ref={buttonRef}
        type="button"
        className="btn btn-primary btn-block"
        onClick={onStart}
      >
        Jugar
      </button>

      <p className="text-sm muted">
        Pulsa Jugar para empezar. Podrás pausar con la tecla{' '}
        <kbd className="kbd" aria-label="Barra espaciadora">Espacio</kbd>.
      </p>
    </div>
  );
}