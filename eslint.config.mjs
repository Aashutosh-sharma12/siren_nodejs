// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'src/**/**/*.ts'],       // 👈 explicitly say which files to lint
    ignores: ['node_modules', 'dist', 'build'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  }
);