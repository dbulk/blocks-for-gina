import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import globals from 'globals';

export default [
  {
    ignores: ['node_modules/**', 'dist/**', 'vite.config.ts', '**/*.test.ts']
  },
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        ...globals.browser,
        ...globals.es2021
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      semi: ['error', 'always']
    }
  },
  {
    files: ['src/core/**/*.ts'],
    ignores: ['src/core/gamecoordinator.ts', 'src/core/gamerunner.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: ['@/presentation/*']
      }]
    }
  }
];
