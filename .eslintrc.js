const path = require('path');
const prettierOptions = require(path.resolve(__dirname, '.prettierrc.js'));

/* eslint-env node */
module.exports = {
  extends: ['react-app', 'alloy', 'alloy/react', 'alloy/typescript', 'next/core-web-vitals', 'next/typescript'],
  plugins: ['react-hooks', 'prettier', 'alloy'],
  root: true,
  ignorePatterns: ['*.test.tsx', 'node_modules/'],
  rules: {
    complexity: ['error', 50],
    'max-params': ['error', 5],
    'max-nested-callbacks': ['error', 5],
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
    'react/no-unstable-nested-components': ['warn', { allowAsProps: true }],
    '@typescript-eslint/explicit-member-accessibility': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': [
      'warn',
      {
        additionalHooks: 'useRecoilCallback',
      },
    ],
    'prefer-promise-reject-errors': 'off',
    'prettier/prettier': ['error', prettierOptions],
    '@next/next/no-img-element': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
  },
  globals: {
    JSX: false,
  },
};
