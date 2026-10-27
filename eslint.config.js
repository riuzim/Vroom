import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/build/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['apps/api/**/*.ts', 'apps/api/prisma/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    // Anti-cheat (issue #31): cars.ts mapeia nome → imageUrl — é a
    // RESPOSTA do jogo. Ele vive fora do barrel do shared de propósito;
    // no cliente só entram nomes (names.ts) e regras (constants/game).
    // Este gate quebra `pnpm lint` (e o CI) de quem importar o catálogo
    // por qualquer caminho: subpath, fonte ou dist.
    files: ['apps/web/**/*.{js,jsx,mjs,ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@vroom/shared/cars',
              message:
                'Anti-cheat: o catálogo mapeia nome→imagem (a resposta do jogo) e nunca pode chegar ao cliente. Use o barrel "@vroom/shared" ou "carNames" de names.',
            },
          ],
          patterns: [
            {
              group: ['**/shared/src/cars*', '**/shared/dist/cars*'],
              message:
                'Anti-cheat: importação direta do catálogo proibida no cliente. Use "@vroom/shared" (barrel sem cars) ou carNames.',
            },
          ],
        },
      ],
    },
  },
  prettier,
);
