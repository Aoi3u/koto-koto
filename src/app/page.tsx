import TypingGame from '@/components/TypingGame';

export default function Home() {
  return (
    <main className="min-h-screen bg-zen-dark relative">
      {/* Noise Overlay */}
      <div className="noise-overlay" />

      {/* Game App */}
      <TypingGame />
    </main>
  );
}
