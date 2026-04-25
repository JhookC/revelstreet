// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },

  // Base rules for all JS/TS files
  eslint.configs.recommended,

  // TypeScript type-checked rules
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // React + a11y: only for source TypeScript files
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      reactPlugin.configs.flat.recommended,
      reactPlugin.configs.flat['jsx-runtime'],
      reactHooksPlugin.configs.flat['recommended-latest'],
      jsxA11yPlugin.flatConfigs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: { version: '19' },
    },
    rules: {
      // Prevent accidental console statements (intentional uses get inline disable)
      'no-console': 'warn',
      // Enforce import type for type-only imports (required by verbatimModuleSyntax)
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      // Allow unused vars/params prefixed with _
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Block deep cross-module imports — use the module barrel instead
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/modules/*/components/*',
                '@/modules/*/hooks/*',
                '@/modules/*/context/*',
                '@/modules/*/api/*',
              ],
              message:
                'Import from the module barrel (modules/<name>/index.ts), not internal paths.',
            },
          ],
        },
      ],
    },
  },

  // Config files (ESLint itself, vite.config.ts) — no browser globals, no project type-checking
  {
    files: ['*.config.{js,ts}', '*.config.*.{js,ts}'],
    languageOptions: {
      globals: globals.node,
    },
  },
);
