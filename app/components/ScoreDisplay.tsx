'use client';

import { useEffect, useState } from 'react';

type Variant = 'wide' | 'compact';

type Props = {
  score: number;
  highScore: number;
  variant?: Variant;
};

export default function ScoreDisplay({
  score,
  highScore,
  variant = 'wide',
}: Props) {
  const isCompact = variant === 'compact';
  const valueStyle = isCompact
    ? { fontSize: 'var(--fs-lg)' }
    : undefined;

  // Anuncios para lectores de pantalla: solo cuando hay un cambio real
  // (score > 0). Evita anunciar "Puntos: 0" al montar el componente.
  const [announcement, setAnnouncement] = useState('');
  useEffect(() => {
    if (score <= 0) {
      setAnnouncement('');
      return;
    }
    setAnnouncement(`Puntos: ${score}`);
  }, [score]);

  return (
    <div
      className="cluster"
      style={{ gap: 'var(--sp-4)', justifyContent: 'center' }}
    >
      <div className="kpi" style={{ minWidth: '120px' }}>
        <span className="label">Puntos</span>
        {/* El `key` cambia con cada nuevo `score`, lo que fuerza a React a
            remontar este <span> y re-disparar la animación `kpi-pop`
            definida en globals.css. Es la forma estándar de "pop al cambiar"
            sin estado extra ni timers manuales. */}
        <span
          className="value"
          style={valueStyle}
          aria-label={`Puntos: ${score}`}
          key={`score-${score}`}
        >
          {score}
        </span>
      </div>

      <div className="kpi" style={{ minWidth: '120px' }}>
        <span className="label">Mejor puntuación</span>
        <span
          className="value"
          style={valueStyle}
          aria-label={
            highScore > 0 ? `Mejor puntuación: ${highScore}` : 'Sin récord todavía'
          }
        >
          {highScore > 0 ? highScore : '—'}
        </span>
      </div>

      {/* Región sr-only con aria-live solo cuando hay algo que anunciar.
          Vacía al montar → no anuncia el estado inicial. */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        key={`announce-${score}`}
      >
        {announcement}
      </div>
    </div>
  );
}