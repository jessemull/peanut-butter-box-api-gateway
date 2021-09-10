module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'standard',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking'
  ],
  ignorePatterns: [],
  overrides: [
    {
      files: '*.test.*',
      rules: {
        '@typescript-eslint/no-unsafe-return': 0,
        '@typescript-eslint/no-explicit-any': 0
      }
    }
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    project: ['./tsconfig.json']
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        'checksVoidReturn': false
      }
    ],
    '@typescript-eslint/unbound-method': 0,
    '@typescript-eslint/prefer-regexp-exec': 0,
    'camelcase': 0
  }
}
