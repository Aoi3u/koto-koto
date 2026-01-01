import nextJest from 'next/jest';

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Keep coverage thresholds per requirement
  coverageThreshold: {
    // lib 行カバレッジ 85%以上
    'src/lib/**/*.{ts,tsx}': {
      lines: 85,
    },
    // 重点フック（useTypingEngine）の行カバレッジ 70%以上
    'src/features/game/hooks/useTypingEngine.ts': {
      lines: 70,
    },
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/app/**',
    '!src/**/index.{ts,tsx}',
    '!**/*.d.ts',
    // Infra-only files are exercised via integration, not unit tests
    '!src/lib/prisma.ts',
    '!src/lib/auth.ts',
    '!src/lib/rate-limit.ts',
  ],
};

export default createJestConfig(customJestConfig);
