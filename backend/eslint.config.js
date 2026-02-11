import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // 1. Ignore build artifacts and dependency folders
  { 
    ignores: ['dist/**', 'node_modules/**', 'build/**', 'out/**'] 
  },
  
  // 2. Base ESLint & TypeScript configurations
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // 3. Custom Project Rules
  {
    languageOptions: {
      parserOptions: {
        project: true, // Automatically finds your tsconfig.json
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // High-value rules for modern TS
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error', // Enforces 'import type' (perfect for verbatimModuleSyntax)
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
);