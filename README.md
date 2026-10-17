# Vroom 🏎️

Jogo de adivinhar carros por imagens borradas — agora um jogo **full-stack completo**: contas de usuário, banco de dados real, loop de jogo **server-authoritative** (o nome do carro nunca sai do servidor antes do fim da rodada), ranking global e desafio diário.

> Uma imagem borrada. Um carro lendário. Você tem 5 chutes.

## Como jogar

- A imagem começa totalmente borrada. A cada **erro**, a nitidez aumenta, uma **letra** é revelada e você perde uma das **5 tentativas**.
- **Classic**: imagem colorida com blur progressivo.
- **Hard**: preto e branco, **pontos em dobro**.
- **Daily**: um carro por dia para todo mundo, **uma rodada por dia**.
- **Pontos**: `10 × tentativas restantes` (×2 no Hard). Visitantes podem jogar, mas só quem tem conta pontua no ranking.

## Arquitetura

Monorepo **pnpm workspaces**:

```
Vroom/
├─ apps/
│  ├─ web/     # Frontend React 18 + Vite + Tailwind (design system estilo shadcn)
│  └─ api/     # Backend Express + TypeScript + Prisma (SQLite)
├─ packages/
│  └─ shared/ # Regras de jogo + catálogo de carros (consumido por web e api)
└─ pnpm-workspace.yaml
```

| Camada | Stack |
| --- | --- |
| Frontend | React 18, Vite 6, Tailwind CSS 3, Radix UI (padrão shadcn/ui), React Router, TanStack Query, react-hook-form + zod, sonner, lucide-react |
| Backend | Express + TypeScript, Prisma ORM (SQLite), Zod, bcryptjs, JWT em cookie httpOnly, express-rate-limit |
| Testes | Vitest (unit no shared, supertest de integração na API, Testing Library no web) |

### Anti-cheat

O loop de jogo é **server-authoritative**: o servidor sorteia o carro, guarda o estado da rodada (tentativas, letras reveladas, blur) e valida cada chute. A resposta **só viaja no payload quando a rodada encerra** — verificado por teste de integração.

## Rodando localmente

Pré-requisitos: Node 20+ e [pnpm](https://pnpm.io) 10+.

```bash
pnpm install

# banco + seed dos carros (apps/api/prisma/dev.db)
pnpm --filter @vroom/api db:migrate
pnpm --filter @vroom/api db:seed

# sobe API (:4000) + web (:5173) em paralelo
pnpm dev
```

Abra http://localhost:5173/Vroom/ — o Vite faz proxy de `/api` para a API (sem CORS no dev).

### Scripts

| Comando | O que faz |
| --- | --- |
| `pnpm dev` | Sobe todos os workspaces em modo watch |
| `pnpm build` | Build de produção (shared → web + api) |
| `pnpm test` | Roda todos os testes |
| `pnpm lint` | ESLint no monorepo inteiro |
| `pnpm --filter @vroom/api db:migrate` | Cria/aplica migrations (Prisma) |
| `pnpm --filter @vroom/api db:seed` | Popula o catálogo de carros |

## API

| Rota | Descrição |
| --- | --- |
| `GET /api/health` | Healthcheck |
| `POST /api/auth/register` / `login` / `logout` · `GET /api/auth/me` | Autenticação (JWT em cookie httpOnly) |
| `POST /api/rounds {mode}` | Inicia/retoma rodada (sem expor o carro) |
| `GET /api/rounds/active` | Rodada em andamento do usuário |
| `POST /api/rounds/:id/guess {guess}` | Valida chute no servidor |
| `POST /api/rounds/:id/skip` | Encerra revelando (0 pontos) |
| `GET /api/leaderboard?period=all\|today&mode=` | Ranking global agregado |
| `GET /api/profile/stats` | Estatísticas do jogador logado |

## Deploy

- **API**: qualquer host Node (Render, Railway, Fly.io). Defina `DATABASE_URL`, `JWT_SECRET`, `PORT` e `CORS_ORIGIN` (veja `apps/api/.env.example`). Rode `pnpm --filter @vroom/api db:deploy && pnpm --filter @vroom/api run db:seed` no primeiro deploy.
- **Web**: build estático (`pnpm --filter @vroom/web build` → `apps/web/dist`). No host, configure `VITE_API_URL` apontando para a API (no build). O GitHub Pages já tem workflow (`.github/workflows/deploy.yml`) — crie o secret `VITE_API_URL` para apontar para sua API em produção.
- **SQLite → PostgreSQL**: o schema é agnóstico a provider (sem enums). Para trocar, mude `provider = "postgresql"` no `schema.prisma`, aponte `DATABASE_URL` e rode `db:migrate` novamente.

> Nota: com BrowserRouter em host estático, deep links diretos (ex.: `/Vroom/leaderboard`) precisam de fallback para `index.html` (no Pages, copie `dist/index.html` para `404.html`).

## Testes

```bash
pnpm test   # 33 testes: regras de jogo (13), integração da API (14), smoke do web (6)
```

A suíte de integração cobre auth, o fluxo completo de rodadas, o bloqueio do daily após o fim, visitante sem pontuação e — o mais importante — **que o payload inicial nunca contém o nome do carro**.

## Feedback

Encontrou um bug ou tem uma ideia? [vroomfeedback@gmail.com](mailto:vroomfeedback@gmail.com) · [Discord](https://discord.gg/JTDE5eMv)
