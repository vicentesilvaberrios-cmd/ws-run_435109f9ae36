'use client';

import { useEffect, useRef, useState } from 'react';
import StartScreen from './components/StartScreen';
import GameBoard from './components/GameBoard';
import GameOverScreen from './components/GameOverScreen';
import ScoreDisplay from './components/ScoreDisplay';

type Status = 'idle' | 'playing' | 'over';

const HIGH_SCORE_KEY = 'snake-high-score';

export default function HomePage() {
  const [status, setStatus] = useState<Status>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [announce, setAnnounce] = useState('');
  const previousHighScoreRef = useRef<number>(0);

  // Cargar mejor puntuación desde localStorage al montar
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(HIGH_SCORE_KEY);
      const parsed = raw ? Number.parseInt(raw, 10) : 0;
      const safe = Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
      setHighScore(safe);
      previousHighScoreRef.current = safe;
    } catch {
      // localStorage no disponible: se mantiene en 0 sin mostrar error al usuario
      setHighScore(0);
      previousHighScoreRef.current = 0;
    }
  }, []);

  const handleStart = () => {
    setScore(0);
    setAnnounce('Juego iniciado');
    setStatus('playing');
  };

  const handleGameOver = (finalScore: number) => {
    const previous = previousHighScoreRef.current;
    const isNewRecord = finalScore > previous;

    if (isNewRecord) {
      previousHighScoreRef.current = finalScore;
      setHighScore(finalScore);
      try {
        window.localStorage.setItem(HIGH_SCORE_KEY, String(finalScore));
      } catch {
        // sin localStorage: el récord solo vive en memoria de esta sesión
      }
    }

    setScore(finalScore);
    setAnnounce(isNewRecord ? 'Juego terminado. Nuevo récord.' : 'Juego terminado');
    setStatus('over');
  };

  const handleRestart = () => {
    setScore(0);
    setAnnounce('Juego iniciado');
    setStatus('playing');
  };

  const handleBackToStart = () => {
    setScore(0);
    setAnnounce('');
    setStatus('idle');
  };

  return (
    <>
      <header className="navbar" role="banner" aria-label="Cabecera">
        <div className="brand" role="img" aria-label="Snake">
          <span className="brand__logo" aria-hidden="true">🐍</span>
          <strong className="brand__name">Snake</strong>
        </div>
        {status === 'playing' && (
          <ScoreDisplay
            score={score}
            highScore={highScore}
            variant="compact"
          />
        )}
      </header>

      <main className="container stack" role="main" style={{ paddingBlock: 'var(--sp-6)' }}>
        {status === 'idle' && (
          <StartScreen highScore={highScore} onStart={handleStart} />
        )}

        {status === 'playing' && (
          <>
            <GameBoard
              onGameOver={handleGameOver}
              onScoreChange={setScore}
              onExitToStart={handleBackToStart}
            />
            <ScoreDisplay score={score} highScore={highScore} variant="wide" />
          </>
        )}

        {status === 'over' && (
          <GameOverScreen
            score={score}
            highScore={highScore}
            previousHighScore={previousHighScoreRef.current}
            onRestart={handleRestart}
            onBackToStart={handleBackToStart}
          />
        )}
      </main>

      {/* Región sr-only para anunciar cambios de estado a lectores de pantalla */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announce}
      </div>
    </>
  );
}