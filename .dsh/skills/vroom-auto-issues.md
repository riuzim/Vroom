# Vroom Auto-Issues Skill

## Objetivo
Trabalhar de forma autônoma no repositório Vroom seguindo o protocolo estabelecido:
- Sempre na branch `dev`
- Execução em lotes de issues pequenas
- Teste → commit → push → merge → deploy → versionamento
- Fechar issues concluídas

## Protocolo Operacional

### 1. Entrada
Se não houver requisição direta do usuário, iniciar rotina:
1. Listar issues abertas do repo `riuzim/Vroom` via API GitHub
2. Ordenar por `prioridade` → `dificuldade` → `tempo`
3. Selecionar lote de issues pequenas (`dificuldade: fácil` + `tempo: <1h`) ou, se bloco contínuo, até 3 issues médias

### 2. Preparação
- `git checkout dev && git pull`
- Confirmar que está em dev
- Ler `AGENTS.md` do repo para regras de versionamento

### 3. Execução por issue
Para cada issue do lote:
1. Analisar evidências e solução descrita no body
2. Implementar alteração no código
3. Rodar testes relevantes:
   - `pnpm --filter @vroom/shared test`
   - `pnpm -r test` se impactar API/web
   - `pnpm lint`
4. Se mudança visível ao jogador:
   - Bump `GAME_VERSION` em `packages/shared/src/version.ts`
   - Adicionar entrada no topo de `VERSION_LOG` com data YYYY-MM-DD e frases em pt-BR
   - `pnpm --filter @vroom/shared build`
5. Commit com conventional commits em pt-BR, escopo correto
6. Push para `dev`
7. Fechar issue via API GitHub com comentário de referência ao commit

### 4. Merge e Deploy
Após lote concluído:
1. `git checkout main`
2. Merge `dev` → `main` via fast-forward quando possível
3. Push `main`
4. Deploy automático via GitHub Pages/Render será disparado

### 5. Versionamento
- Patch para correções
- Minor para novidades visíveis ao jogador
- Sempre rebuild do shared após editar `version.ts`

### 6. Saída
Relatório conciso de issues processadas, commits e versão atual.

## Regras de Ouro
- Nunca commitar direto em `main`
- Não alterar README sem necessidade
- Fechar issues apenas após testes verdes
- Manter `dev` sempre sincronizada
- Não fazer merge manual do usuário; só após testes

## Automação
Esta skill é aplicada automaticamente em qualquer sessão no repo Vroom quando não houver requisição direta.
