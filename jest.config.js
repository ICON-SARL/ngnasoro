
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  testMatch: [
    '**/tests/unit/**/*.test.(ts|tsx)',
    '**/tests/integration/**/*.test.(ts|tsx)',
  ],
  setupFilesAfterEnv: [
    '<rootDir>/src/tests/setupTests.ts',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/main.tsx',
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
