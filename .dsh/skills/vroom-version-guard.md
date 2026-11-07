# Vroom Version Guard Skill

## Objetivo
Garantir que toda mudança visível ao jogador siga o protocolo de versionamento do AGENTS.md.

## Regras
1. Antes de commit, verificar se arquivos alterados incluem `apps/web/src/pages/**`, `apps/web/src/components/**` com mudança visual, ou `packages/shared/src/game.ts`
2. Se sim, exigir:
   - `packages/shared/src/version.ts` atualizado
   - `GAME_VERSION` bumped
   - `VERSION_LOG` com entrada no topo, data YYYY-MM-DD, frases em pt-BR
3. Rodar `pnpm --filter @vroom/shared build`
4. Rejeitar commit se regra não cumprida

## Fluxo
- Detectar mudanças visíveis
- Rodar `node scripts/version-guard.js`
- Validar versionamento
- Build shared
- Commit com escopo `feat(shared)` ou `feat(web)`

## Automação
Esta skill roda automaticamente antes de `git_commit_push` em qualquer sessão no repo Vroom.
