# Vroom — regras para agentes de IA

Instruções de trabalho para qualquer agente (Claude Code, Codex, DSH, etc.)
neste repositório. Vale para TODAS as tarefas a partir de 26/10/2026.

## Branch: sempre `dev`

- **Desenvolva SEMPRE na branch `dev`** — nunca commite direto na `main`.
  Se a `dev` não existir no clone local, crie a partir da `main`
  (`git checkout -b dev origin/main` ou `git checkout main` + `git checkout -b dev`)
  e publique (`git push -u origin dev`).
- Ao pegar uma tarefa: `git checkout dev` + `git pull` antes de começar.
- Commits seguem o padrão já usado no histórico: conventional commits com
  escopo e mensagem curta em pt-BR (ex.: `fix(api): ...`, `feat(web): ...`,
  `feat(shared): ...`).
- `main` só recebe merge de `dev` **quando o dono (riuzimjp) pedir**.
  Não faça merge nem deploy por conta própria.

## Versionamento do jogo

Toda mudança que o jogador percebe (novidade, correção, ajuste de jogo)
entra no sinal de versionamento da aba de Feedback:

1. Suba `GAME_VERSION` em `packages/shared/src/version.ts`
   (patch para correção, minor para novidade).
2. Adicione a entrada no TOPO do `VERSION_LOG` no mesmo arquivo:
   `version`, `date` (YYYY-MM-DD) e `changes` (frases curtas em pt-BR,
   uma por mudança, voz "o jogo agora …").
3. Rebuild do shared depois de editar:
   `pnpm --filter @vroom/shared build`.

Mudança invisível ao jogador (refactor, CI, teste) não sobe versão.

## Rotina antes de entregar

1. `pnpm --filter @vroom/shared build` (se mexeu no shared).
2. `pnpm -r test` — tudo verde.
3. `pnpm lint` — sem erros.
4. Commit(s) na `dev` + `git push`.

## Mapa rápido do monorepo

- `apps/web` — React + Vite (páginas em `src/pages`, i18n em
  `i18n/locales/{pt-BR,en,es}.json` — sempre os três idiomas).
- `apps/api` — Express + Prisma + Postgres (rotas em `src/routes`,
  schema em `prisma/schema.prisma`; migrations manuais em
  `prisma/migrations`, pasta com timestamp `AAAAMMDDHHMMSS_nome`).
- `packages/shared` — contrato entre API e web (`src/`), rebuild obrigatório
  após editar; `cars.ts` fica FORA do barrel de propósito (anti-cheat:
  o cliente nunca pode mapear nome → imagem).
