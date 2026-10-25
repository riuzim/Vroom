# Implementação — Fase 1 das recomendações de gameplay

> Execução das recomendações da pesquisa [`docs/pesquisa-gameplay-diferenciais.md`](pesquisa-gameplay-diferenciais.md) (user: "seguindo as recomendacoes da pesquisa implemente isso no vroom").
> Escopo aprovado: **Fase 1 completa** (share-grid, streak, stats, modo silhueta, séries temáticas) + registro do desafio do dia deixando o **archive pronto para o futuro**.

## O que entrou (recomendação → entrega)

| Rec.         | O quê                  | Como ficou                                                                                                                                                                                                                                                                                                                         |
| ------------ | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1           | Share-grid sem spoiler | Botão **Compartilhar** no fim de toda rodada (e no card "daily concluído"). Texto estilo Wordle: `Vroom Daily #12` / `🟥🟥🟩 3/5` / `🔥 7` / link. Sem spoiler: quem não jogou não vê nome; quem jogou decodifica (sincronia social). Usa `navigator.share` com fallback para clipboard.                                           |
| A2           | Streak diário          | Streak **por participação** (acertou, falhou ou pulou o Daily conta — lição da pesquisa: streak pune o comportamento errado quando só vitória conta). Tolerância de 1 dia: voltar depois de uma pausa curta não zera. Calculado no servidor (`computeStreak`) sobre as rodadas diárias encerradas.                                 |
| A3           | Stats                  | `GET /api/profile/stats` agora traz `daily: { played, wins, distribution[6], streak: { current, best } }`. Perfil ganhou um card Daily: 🔥 sequência atual, recorde, % de vitórias e distribuição de chutes (1–5 + X) em barras.                                                                                                   |
| B1           | Modo Silhueta          | Novo modo `silhouette`: a foto começa quase preta e **a luz sobe a cada erro** (0.08 → 1.0 de brightness), revelando por completo no fim da rodada. Implementado com filtro CSS no `CarStage` — zero processamento de imagem no servidor, mesmo fluxo/anti-cheat dos modos livres.                                                 |
| B3           | Séries temáticas       | Novo modo `themed` (UI: **Série**): um tema por dia na rotação determinística `THEMES` (jdm → muscle → supercar → sport → classic → bra → ev → lux). Todo mundo joga o **mesmo carro da série** no mesmo dia, uma rodada por dia — como o Daily, mas dentro de um nicho. O tema do dia aparece no badge do jogo e no card da Home. |
| A4 (parcial) | Archive-ready          | Toda primeira partida de `daily`/`themed` do dia registra `DailyCar { date, mode, carId }` — o carro do dia fica **congelado** na tabela (mesmo que o catálogo mude). A UI do archive (Fase 2) é só consumir essa tabela.                                                                                                          |

## Detalhes técnicos

### Banco (`apps/api/prisma/schema.prisma`)

- Novo model `DailyCar { id, date, mode, carId }` com `@@unique([date, mode])` — migration `20261101000000_add_daily_car` (Postgres, mesmo estilo da init).
- Slot do modo themed: `data#tema` (ex.: `2026-10-24#ev`) — daily e série nunca colidem.
- Aplicar em dev/produção: `pnpm --filter @vroom/api db:deploy`.

### API (`apps/api/src/routes/`)

- `rounds.ts` — `pickDailyCar` resolve pela tabela `DailyCar` primeiro (carro congelado vale até inativo); se não existe, calcula o índice determinístico e registra com catch de corrida (P2002). `dailyCarIndex` aceita sufixo `#tema` (bug corrigido: `Date.parse` com `#` virava NaN → 500).
- `profile.ts` — streak/distribuição derivados das rodadas diárias encerradas. Distribuição conta o chute vencedor como `attemptsUsed + 1` (o acerto não incrementa `attemptsUsed` no servidor — mesma regra dos pontos).

### Shared (`packages/shared/src/`)

- `constants.ts` — `GAME_MODES += silhouette, themed`; `THEMES` + `themeOfDay(date)`; `DAILY_EPOCH = 2026-11-01` + `dailyNumber(date)` (o `#N` do share).
- `game.ts` — `buildShareText(...)` (grid de emojis por status) e `computeStreak(dates, today)` (best + current com tolerância de 1 dia).

### Web (`apps/web/src/`)

- `ShareButton.jsx` (novo) — share nativo → clipboard → textarea legacy, com toasts i18n.
- `CarStage.jsx` — prop `mode`/`mistakes`; silhueta = `brightness() contrast()` progressivo em vez de `blur()`.
- `Game.jsx` — badges dos modos novos (Série mostra o tema do dia), botão de share no fim da rodada e no card diário; streak buscada fresca no clique (cache pode estar defasado).
- `Home.jsx` — cards Silhouette (Ghost) e Série (Sparkles, badge com o tema de hoje via `themeOfDay`).
- `Profile.jsx` — card Daily (streak/recorde/%/distribuição em barras), estado vazio convidando a jogar.
- `useVroomGame.js` — expõe `theme`, `dailyNum`, `attemptsUsed`; `dailyDone` vale também para themed; invalida `['stats']` no fim de rodada diária.
- i18n: chaves novas nos 3 locales (`game.share*`, `game.themedBadge`, `profile.daily*`, `themes.*`, `home.modes.silhouette|themed`) — paridade validada por teste.

## Verificação

- API: 32/32 testes (`pnpm --filter @vroom/api test`) — inclui 5 testes novos: silhueta joga como livre + anti-cheat, themed é diário com tema no payload, dois usuários recebem o MESMO carro (via DailyCar), themed registra slot datado, stats traz streak/distribuição.
- Shared: 27/27 (`pnpm --filter @vroom/shared test`) — cobre `buildShareText` e `computeStreak`.
- Web: 44/44 (`pnpm --filter @vroom/web test`) + build Vite limpo.
- Smoke no dev: `silhouette` joga com anti-cheat; `themed` retorna `dailyDate=2026-10-24#ev, theme=ev`.
- Lint: 0 erros. Prettier aplicado aos arquivos tocados.

## O que ficou para a Fase 2 (próximo passo natural)

1. **Archive** — UI consumindo `DailyCar` (jogar dias perdidos com reveal opcional; tabela já registra tudo).
2. **Duelo por link** — desafio assíncrono com o mesmo carro (a base determinística já garante igualdade).
3. **Garage/coleção** — carros acertados viram troféus com raridade por categoria.
4. **Modo ordenação** ("Cranked-style") e **specs/mais-ou-menos** — precisam de campos de specs no catálogo (hoje só há `category`).

## Notas de deploy

- Rodar `pnpm --filter @vroom/api db:deploy` antes do primeiro deploy com esse código (cria `DailyCar`).
- Nenhuma variável de ambiente nova; nenhuma dependência nova.
