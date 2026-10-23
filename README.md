# Vroom 🏎️

> Uma imagem borrada. Um carro lendário. Você tem 5 chutes.

Adivinhe o carro pela foto que vai clareando a cada chute errado — com ranking global, desafio diário e um catálogo recheado de clássicos e modernos, tudo direto do navegador.

## 🚗 Baixe e jogue

O jogo roda no seu computador. A preparação é uma vez só e leva uns minutos; depois, jogar é um comando.

### Preparação (uma vez só)

1. Instale o **Node.js** (versão 20 ou mais recente) — baixe em <https://nodejs.org>, botão **LTS**.
2. Instale o **pnpm**. Abra um terminal (PowerShell no Windows, Terminal no macOS/Linux) e rode:
   ```bash
   npm install -g pnpm
   ```
3. **Baixe o jogo**: nesta página, use o botão verde **Code → Download ZIP** e descompacte onde preferir. Quem prefere git pode clonar:
   ```bash
   git clone https://github.com/riuzim/Vroom.git
   ```
4. Entre na pasta do jogo e rode:

   ```bash
   pnpm setup
   ```

   Esse comando instala tudo e prepara o banco de dados local. Na primeira vez demora alguns minutos — é normal, ele baixa as ferramentas do banco. Se algo interromper no meio, rode de novo: o comando é seguro de repetir.

### Pra jogar

Ainda na pasta do jogo:

```bash
pnpm dev
```

Abra **<http://localhost:5173/Vroom/>** no navegador e boa sorte. Pra encerrar, aperte **Ctrl+C** no terminal (ou feche a janela).

**Nas vezes seguintes** é só este passo — a preparação não precisa se repetir.

### 🆘 Deu problema?

- **`pnpm` não é reconhecido** → feche o terminal, abra um novo e tente de novo (às vezes o sistema demora a "ver" o programa recém-instalado).
- **Erro de banco de dados / conexão recusada** → o `pnpm dev` sobe o banco local sozinho, então isso só acontece se outra coisa ocupar a porta **5433**. Se acontecer, encerre o que estiver usando a porta (ou rode `pnpm --filter @vroom/api db:local` e veja a mensagem de erro) e tente de novo.
- **Windows: erro `EPERM` citando `query_engine...dll`** → outro programa (geralmente o VS Code) prendeu o arquivo. Feche o VS Code e rode `pnpm setup` de novo.
- **Nada resolveu?** Fala com a gente: [vroomfeedback@gmail.com](mailto:vroomfeedback@gmail.com).

## 🎯 As regras

- A foto começa **totalmente borrada**. A cada **erro**: a imagem ganha nitidez, **uma letra** do nome aparece e você perde uma das **5 tentativas**.
- **Classic** — foto colorida, nitidez progressiva.
- **Hard** — preto e branco, **pontos em dobro**. Pra quem confia no olho.
- **Daily** — o mesmo carro pra todo mundo, **uma rodada por dia**. Volte amanhã: é um carro novo.
- **Pontos**: `10 × tentativas restantes` (o dobro no Hard).
- Dá pra jogar **sem conta**, mas só quem tem conta pontua no ranking global — criar é grátis e leva menos de um minuto.
- **Sem trapaça**: o nome do carro fica guardado no servidor até o fim da rodada. Espiar o código da página não revela nada. 😉

## 📸 As fotos

Todas as imagens vêm do **Wikimedia Commons** com licenças livres. O autor e a licença de cada foto aparecem ao fim da rodada, e a página `/creditos` dentro do jogo traz a lista completa.

## 🗣️ Feedback

Achou um bug? Tem uma ideia de carro pro catálogo?

- [vroomfeedback@gmail.com](mailto:vroomfeedback@gmail.com)

---

## 🛠️ Pros curiosos de plantão

<details>
<summary>Clique pra ver a parte técnica — stack, arquitetura e comandos</summary>

### Arquitetura

Monorepo **pnpm workspaces**:

```
Vroom/
├─ apps/
│  ├─ web/     # Frontend React 18 + Vite 6 + Tailwind (design system estilo shadcn)
│  └─ api/     # Backend Express + TypeScript + Prisma (PostgreSQL)
├─ packages/
│  └─ shared/ # Regras de jogo + catálogo de carros (consumido por web e api)
└─ pnpm-workspace.yaml
```

| Camada   | Stack                                                                                                                                    |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend | React 18, Vite 6, Tailwind CSS 3, Radix UI (padrão shadcn/ui), React Router, TanStack Query, react-hook-form + zod, sonner, lucide-react |
| Backend  | Express + TypeScript, Prisma ORM (PostgreSQL), Zod, bcryptjs, JWT em cookie httpOnly, express-rate-limit                                 |
| Testes   | Vitest (unit no shared, integração via supertest na API, Testing Library no web)                                                         |

**Anti-cheat**: o loop de jogo é **server-authoritative** — o servidor sorteia o carro, guarda o estado da rodada (tentativas, letras reveladas, nível de blur) e valida cada chute. A resposta **só viaja no payload quando a rodada encerra**, garantido por teste de integração.

### Banco de dados (PostgreSQL)

- **Dev**: Postgres **embutido** (binários via [`embedded-postgres`](https://www.npmjs.com/package/embedded-postgres)) — sem Docker e sem instalar nada. `pnpm --filter @vroom/api db:local` sobe um servidor na porta **5433**, com dados persistentes em `apps/api/.pg-data` (gitignored). A `DATABASE_URL` de dev já vem pronta no `apps/api/.env.example`.
- **Testes**: a suíte sobe um cluster descartável em `apps/api/.pg-test-data` (gitignored, apagado no fim — `apps/api/src/tests/global-setup.ts`) — nasce e morre com os testes, sem risco de tocar dados reais.
- **Produção**: Supabase ou Neon — veja as instruções de conexão em `apps/api/.env.example` (Session pooler) e o guia completo em [`docs/deploy.md`](docs/deploy.md).
- Migrations são de Postgres (`apps/api/prisma/migrations/`). As antigas, da era SQLite, foram aposentadas em `apps/api/prisma/migrations-sqlite/`.

### Catálogo de carros

As imagens **não dependem de nenhum host externo em runtime**: os bytes (JPEG/PNG, lado maior ≤1280px) são gravados como BYTEA no Postgres e servidos pela própria API em `GET /api/cars/:id/image`. Cada carro carrega sua proveniência — `brand`, `model`, `years`, `author`, `license`, `filePageUrl` — herdada do levantamento verificado no Wikimedia Commons (`levantamento/`). O cache de imagens é versionado no repositório (`apps/api/prisma/car-images/`), então a seed funciona **100% offline**.

| Comando                            | O que faz                                                                                     |
| ---------------------------------- | --------------------------------------------------------------------------------------------- |
| `pnpm catalog`                     | Valida `levantamento/batches/` e regera `shared/cars.ts`, `shared/names.ts` e o catálogo JSON |
| `pnpm catalog:images`              | Baixa as imagens do Commons para o cache local                                                |
| `pnpm --filter @vroom/api db:seed` | Grava os bytes do cache como BYTEA + atribuição no banco                                      |

### API

| Rota                                                                | Descrição                                                         |
| ------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `GET /api/health`                                                   | Healthcheck                                                       |
| `GET /api/cars/:id/image`                                           | Bytes da imagem do carro, direto do banco (BYTEA, cache imutável) |
| `POST /api/auth/register` / `login` / `logout` · `GET /api/auth/me` | Autenticação (JWT em cookie httpOnly)                             |
| `POST /api/rounds {mode}`                                           | Inicia/retoma rodada (sem expor o carro)                          |
| `GET /api/rounds/active`                                            | Rodada em andamento do usuário                                    |
| `POST /api/rounds/:id/guess {guess}`                                | Valida chute no servidor                                          |
| `POST /api/rounds/:id/skip`                                         | Encerra revelando (0 pontos)                                      |
| `GET /api/leaderboard?period=all\|today&mode=`                      | Ranking global agregado                                           |
| `GET /api/profile/stats`                                            | Estatísticas do jogador logado                                    |

### Scripts

| Comando                                   | O que faz                                                                                            |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `pnpm setup`                              | Prepara tudo: deps, build do shared, `.env`, Prisma client e banco local                             |
| `pnpm dev`                                | Sobe API (:4000) + web (:5173) — e o Postgres local junto, se ainda não estiver no ar                |
| `pnpm build`                              | Build de produção (shared → web + api)                                                               |
| `pnpm test`                               | Roda todos os testes                                                                                 |
| `pnpm lint`                               | ESLint no monorepo inteiro                                                                           |
| `pnpm --filter @vroom/api db:local`       | Sobe o Postgres embutido e deixa rodando (Ctrl+C encerra)                                            |
| `pnpm --filter @vroom/api db:local-setup` | Prepara o banco local: sobe o PG embutido, aplica migrations e roda a seed (usado pelo `pnpm setup`) |
| `pnpm --filter @vroom/api db:migrate`     | Cria/aplica migrations em dev (Prisma)                                                               |
| `pnpm --filter @vroom/api db:deploy`      | Aplica migrations em produção                                                                        |
| `pnpm --filter @vroom/api db:seed`        | Popula o catálogo de carros                                                                          |

### Testes

```bash
pnpm test
```

A suíte de integração cobre auth, o fluxo completo de rodadas, o bloqueio do daily após o fim, visitante sem pontuação e — o mais importante — **que o payload inicial nunca contém o nome do carro**. A suíte levanta seu próprio Postgres embutido descartável, então não precisa de banco configurado pra rodar.

### Deploy

- **Web**: build estático (`pnpm --filter @vroom/web build` → `apps/web/dist`). O workflow do GitHub Pages (`.github/workflows/deploy.yml`) já existe — crie o secret `VITE_API_URL` apontando pra sua API de produção (o workflow também copia `index.html` → `404.html` pro fallback de deep links do BrowserRouter). Pra domínio próprio com HTTPS, Caddy, AdSense e LGPD, veja [`docs/deploy.md`](docs/deploy.md).
- **API**: qualquer host Node (Render, Railway, Fly.io, VPS…). Defina `DATABASE_URL` (Postgres — Supabase/Neon), `JWT_SECRET` (32+ caracteres em produção), `PORT` e `CORS_ORIGIN` (veja `apps/api/.env.example`). No primeiro deploy, rode `pnpm --filter @vroom/api db:deploy && pnpm --filter @vroom/api db:seed` — as imagens estão no repo, então a seed não precisa de internet.

</details>

---

**Vroom** · feito no box por quem ama carros · [feedback](mailto:vroomfeedback@gmail.com)
