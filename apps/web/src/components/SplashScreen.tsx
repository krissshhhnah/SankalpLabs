import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinished: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinished }) => {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');

  useEffect(() => {
    // Phase 1: Fade in (600ms)
    const enterTimer = setTimeout(() => setPhase('hold'), 600);
    // Phase 2: Hold (1200ms), then exit
    const holdTimer = setTimeout(() => setPhase('exit'), 1800);
    // Phase 3: Fade out (500ms), then done
    const exitTimer = setTimeout(() => onFinished(), 2300);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
    };
  }, [onFinished]);

  return (
    <div
      className="splash-screen"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)',
        opacity: phase === 'exit' ? 0 : 1,
        transition: 'opacity 500ms ease-out',
      }}
    >
      {/* Glow behind logo */}
      <div
        style={{
          position: 'absolute',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
          opacity: phase === 'enter' ? 0 : 1,
          transition: 'opacity 800ms ease-out',
        }}
      />

      {/* Logo */}
      <img
        src="/logo_bgless.png"
        alt="SankalpLabs"
        style={{
          width: 140,
          height: 140,
          objectFit: 'contain',
          opacity: phase === 'enter' ? 0 : 1,
          transform: phase === 'enter' ? 'scale(0.8)' : 'scale(1)',
          transition: 'opacity 600ms ease-out, transform 600ms cubic-bezier(0.16, 1, 0.3, 1)',
          filter: 'drop-shadow(0 0 40px rgba(99, 102, 241, 0.3))',
        }}
      />

      {/* Brand name */}
      <h1
        style={{
          marginTop: 24,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: '#f1f5f9',
          opacity: phase === 'enter' ? 0 : 1,
          transform: phase === 'enter' ? 'translateY(12px)' : 'translateY(0)',
          transition: 'opacity 600ms ease-out 200ms, transform 600ms cubic-bezier(0.16, 1, 0.3, 1) 200ms',
        }}
      >
        SankalpLabs
      </h1>

      {/* Tagline */}
      <p
        style={{
          marginTop: 8,
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase' as const,
          color: '#94a3b8',
          opacity: phase === 'enter' ? 0 : 1,
          transform: phase === 'enter' ? 'translateY(8px)' : 'translateY(0)',
          transition: 'opacity 600ms ease-out 400ms, transform 600ms cubic-bezier(0.16, 1, 0.3, 1) 400ms',
        }}
      >
        Infinite Canvas Workspace
      </p>

      {/* Loading bar */}
      <div
        style={{
          marginTop: 40,
          width: 180,
          height: 3,
          borderRadius: 4,
          background: 'rgba(148, 163, 184, 0.15)',
          overflow: 'hidden',
          opacity: phase === 'enter' ? 0 : 1,
          transition: 'opacity 400ms ease-out 500ms',
        }}
      >
        <div
          style={{
            height: '100%',
            borderRadius: 4,
            background: 'linear-gradient(90deg, #6366f1, #818cf8)',
            width: phase === 'hold' || phase === 'exit' ? '100%' : '0%',
            transition: 'width 1400ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>
    </div>
  );
};
