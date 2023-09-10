/* eslint-env node */
module.exports = {
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    root: true,
    ignorePatterns: ['pages', 'dist', 'docs'],
    rules: {
        quotes: [2, 'single', { 'avoidEscape': true }]
    }
  };