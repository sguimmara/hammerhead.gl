/* eslint-env node */
module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended-type-checked'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: ['tsconfig.json', 'tests/tsconfig.json', 'examples/tsconfig.json'] ,
    },
    plugins: ['@typescript-eslint'],
    root: true,
    ignorePatterns: ['pages', 'dist', 'docs', 'vite.config.ts', '.eslintrc.cjs'],
    rules: {
        quotes: [2, 'single', { 'avoidEscape': true }]
    }
  };