module.exports = {
  collectCoverage: true,
  preset: 'ts-jest',
  setupFiles: ['./src/config/test-setup.ts'],
  testEnvironment: 'node'
}
