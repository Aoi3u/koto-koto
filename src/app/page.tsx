import TypingGame from '@/components/TypingGame';

export default function Home() {
  return (
    <main className="min-h-screen bg-zen-dark relative selection:bg-matcha selection:text-zen-dark">
      {/* Noise Overlay */}
      <div className="noise-overlay" />

      {/* Game App */}
      <TypingGame />
    </main>
  );
}
