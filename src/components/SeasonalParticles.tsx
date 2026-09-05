'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface SeasonalParticle {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  size: number;
}

interface SeasonalParticlesProps {
  emoji: string;
  color: string;
  count?: number;
}

function generateParticles(count: number): SeasonalParticle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -10 - Math.random() * 50,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 10,
    size: 0.8 + Math.random() * 0.4,
  }));
}

/**
 * Animated seasonal particles (sakura petals, snowflakes, leaves, etc.)
 * Creates a subtle, zen atmosphere
 */
export default function SeasonalParticles({ emoji, color, count = 15 }: SeasonalParticlesProps) {
  // SSR と CSR の初期出力差分を避けるため、初期は空配列を描画し、
  // クライアントマウント後にランダム生成する
  const [particles, setParticles] = useState<SeasonalParticle[]>([]);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setParticles(generateParticles(count));
  }, [count]);

  // Memoize animation variants to prevent unnecessary motion.div re-renders
  const animationVariants = useMemo(
    () => ({
      initial: { opacity: 0 },
      animate: {
        y: '120vh',
        opacity: [0, 0.3, 0.3, 0],
        x: [0, 20, -10, 5],
      },
      transition: {
        repeat: Infinity,
        ease: 'linear' as const,
      },
    }),
    [] // animation variants are static
  );

  // A full-viewport field of continuously drifting particles is exactly the
  // kind of ambient motion prefers-reduced-motion asks us to drop. Gated on
  // particles.length (not prefersReducedMotion alone): that hook resolves
  // synchronously on the client, ahead of the server's render, so branching
  // on it directly would mismatch during hydration. particles.length stays
  // 0 through hydration either way, so this only takes effect afterward.
  if (particles.length > 0 && prefersReducedMotion) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute text-2xl opacity-30"
          style={{
            left: `${particle.x}%`,
            fontSize: `${particle.size}rem`,
            filter: `drop-shadow(0 0 8px ${color})`,
          }}
          initial={{ ...animationVariants.initial, y: `${particle.y}vh` }}
          animate={animationVariants.animate}
          transition={{
            ...animationVariants.transition,
            duration: particle.duration,
            delay: particle.delay,
          }}
        >
          {emoji}
        </motion.div>
      ))}
    </div>
  );
}
