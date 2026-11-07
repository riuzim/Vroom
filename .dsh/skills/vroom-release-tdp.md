# Vroom Release TDP Workflow

## Objetivo
Orquestrar release completo dev → main → deploy com versionamento.

## Passos
1. `git checkout dev && git pull`
2. `pnpm -r test && pnpm lint`
3. Verificar versionamento via vroom-version-guard
4. `git_commit_push` com message conventional
5. `git checkout main`
6. `git merge dev`
7. `git push origin main`
8. Atualizar CHANGELOG se necessário
9. Criar tag `v${GAME_VERSION}`

## Automação
Executa em lote após conclusão de issues.
