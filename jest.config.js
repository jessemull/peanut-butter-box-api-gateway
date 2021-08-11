module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/lib/logger.ts',
    '!src/**/index.ts'
  ],
  preset: 'ts-jest',
  setupFiles: ['./src/config/test-setup.ts'],
  testEnvironment: 'node'
}
