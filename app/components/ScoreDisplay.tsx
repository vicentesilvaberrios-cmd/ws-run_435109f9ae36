'use client';

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

  return (
    <div
      className="cluster"
      style={{ gap: 'var(--sp-4)', justifyContent: 'center' }}
      aria-live="polite"
      aria-atomic="true"
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
    </div>
  );
}