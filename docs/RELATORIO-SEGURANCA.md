# Relatório de Segurança — Vroom

**Data:** 2026-10-18 · **Escopo:** monorepo completo (apps/api, apps/web, packages/shared, CI/CD) · **Método:** análise manual orientada por ameaças + 2 auditorias independentes (backend e frontend/deploy) + verificação adversarial da implementação (agente interrompido por limitação de sandbox do harness após revisão parcial — a cobertura final é sustentada pelas duas auditorias e pela bateria de testes abaixo), com validação por testes automatizados, e2e e auditoria de dependências.

---

## 1. Sumário executivo

Foram identificadas **19 brechas** (2 críticas de integridade do jogo, 4 altas, 9 médias e 4 baixas, além de pendências de CI). **Todas as acionáveis foram corrigidas** e o login com Google foi implementado ponta a ponta. Nenhum arquivo de responsabilidade visual do agente de design foi alterado (Game.jsx, GuessInput.jsx, useVroomGame.js, Profile.jsx, CarStage.jsx, DitherCar.jsx, Header.jsx e componentes ui/* permanecem intocados; o agente commitou seu trabalho em paralelo sem conflito).

Validação final: **47 testes verdes** (15 shared · 26 api · 6 web), `tsc --noEmit` limpo, e2e contra o servidor real comprovando server-authoritative intacto, build do web **sem nenhuma URL do catálogo no bundle**, `pnpm audit --audit-level critical` = **0 críticos**.

---

## 2. Brechas e correções

### Críticas

| # | Brecha | Correção |
|---|--------|----------|
| C1 | **Catálogo completo de carros (com imageUrls) embutido no bundle JS** — um jogador podia abrir o console, ver todas as 41 URLs e buscar o nome em 30s; quebrava a integridade central do jogo. | Novo `packages/shared/src/names.ts` com array literal de nomes; `cars.ts` fora do barrel (`@vroom/shared` exporta só nomes/regras); subpath `@vroom/shared/cars` para o seed da API; teste de sincronização nomes↔catálogo. Prova no build: `grep imgur dist/assets/*.js` = 0. |
| C2 | **Race condition em acertos paralelos** — N requisições simultâneas de "acerto" pontuavam N× (leitura-escrita sem guarda); o mesmo valia para erros paralelos, skips e criação de daily. | Acerto: transação Prisma com `updateMany` guardado por `status:'playing' AND attemptsUsed:<lido>` + `@@unique([roundId])` em Score (guarda dupla, migration com dedup de dados legados); perdedores recebem 409. Erros/skip: mesmo padrão updateMany guardado. Daily: catch P2002 + re-fetch. Testes de race paralelos (5 acertos → 1×200 + 4×409 + score único). |

### Altas

| # | Brecha | Correção |
|---|--------|----------|
| H1 | `POST /api/rounds` e `/skip` sem rate limit — permitia farm de dailies/rodadas e correlação de imageUrls em massa. | start 10/min, skip 15/min, ranking 60/min, auth 20/15min e **limiter global 300/min na API inteira** (todos com `skip` em teste). |
| H2 | `trust proxy` ausente — atrás de proxy/reverso os IPs errados alimentam os limiters e logs. | `TRUST_PROXY` configurável (`""`/`true`/nº de hops) validado no env schema. |
| H3 | `jwt.verify` sem pin de algoritmo — tokens `alg:none`/confusão de algoritmo em bibliotecas permissivas. | `algorithms: ['HS256']` fixo. |
| H4 | Sem helmet — ausência da base de headers de segurança (nosniff, frame-options, COOP, etc.). | `helmet({contentSecurityPolicy:false})` (CSP fica no front) + `x-powered-by` desativado. Confirmado vivo por smoke HTTP. |

### Médias

| # | Brecha | Correção |
|---|--------|----------|
| M1 | **Timing oracle no login** — bcrypt só rodava se o usuário existia; resposta mais lenta enumerava emails. | Comparação constante contra hash dummy quando o usuário não existe. |
| M2 | **409 diferenciado no registro** ("Email já registrado" vs "Nome de usuário já em uso") — enumeração de contas. | Mensagem única + catch P2002 do Prisma. |
| M3 | JWT_SECRET fraco/de exemplo em dev e sem exigência em produção. | Schema exige **32+ chars em produção** com blocklist dos valores de exemplo/teste; `.env` local regenerado com secret de 48 bytes aleatórios. |
| M4 | Cookie `sameSite:'lax'` quebraria sessão em produção (GitHub Pages ↔ API cross-site); logout sem flags espelhadas não removia o cookie. | `sameSite:'none'` + `secure` em produção; clear com as mesmas flags. |
| M5 | Error handler refletia `originalUrl` (fingerprint de rotas) e transformava JSON malformado em 500. | 404 estático; `SyntaxError`→400; status 4xx respeitado; guarda `headersSent`. |
| M6 | `:id` inválido (NaN) chegava ao Prisma e gerava 500. | `z.coerce.number().int().positive()` → 404 limpo. |
| M7 | Sem CSP no front — qualquer injeção futura correria sem barreira. | CSP via plugin Vite no **build** (`default-src 'self'; script-src 'self' https://accounts.google.com; …`), sem tocar o index.html (dev fica livre para HMR). |
| M8 | Deploy: 5 actions pinadas por tag mutável; **CI não rodava testes nem audit**; build do web não compilava o shared nem gerava o client do Prisma (deploy estava quebrado para o bundle novo); deep links no GH Pages davam 404. | 5 actions pinadas por **SHA40**; steps de build shared + `prisma generate` + `pnpm -r test` + `pnpm audit --audit-level critical`; `cp dist/index.html dist/404.html`. |
| M9 | Dependências com críticos publicados (vitest <3.2.6 e tinypool via vitest 2.1.9 — gadget de RCE em ambiente de teste) + lockfile desincronizado. | vitest 4.1.12 nos 3 packages, vite 6.4.4, lockfile regenerado; `pnpm audit` crítico = 0. |

### Baixas

| # | Brecha | Correção |
|---|--------|----------|
| L1 | Senha >72 bytes truncava silenciosamente no bcrypt. | Refine Zod de 72 bytes + teste (73 chars → 400). |
| L2 | `optionalAuth` aplicado duas vezes em `/me` (global + rota). | Avaliado como inócuo (idempotente, custo desprezível) e mantido por auto-documentação da rota. |
| L3 | Limpeza de rodadas de visitante executava `deleteMany` em toda chamada de start. | Memoizada 1×/60s. |
| L4 | `x-powered-by` exposto. | `app.disable('x-powered-by')` (conta também em H4). |

---

## 3. Login com Google (implementado ponta a ponta)

**Backend** — `POST /api/auth/google` com `{credential}` (ID token do GIS):
- `google-auth-library@9` com `verifyIdToken({idToken, audience: GOOGLE_CLIENT_ID})` — client novo por request, sem estado;
- rejeita: token inválido (401), payload sem `sub`/`email` (401), **`email_verified !== true` (401 — campo ausente também rejeita)**, serviço não configurado (503);
- `findOrCreateGoogleUser`: por `googleId` → por e-mail (vínculo com re-fetch em P2002) → criação com username derivado do e-mail (sanitizado, sufixo único, fallback temporal);
- schema: `User.passwordHash String?` (contas Google não têm senha) + `User.googleId String? @unique`; migration `20261017221003_google_auth_score_unique` aplicada (inclui dedup de Scores legados da race);
- usa o mesmo cookie JWT httpOnly da aplicação — nada de estado novo na sessão.

**Frontend** — `GoogleLoginButton.jsx` carrega o GSI (`accounts.google.com/gsi/client`) dinamicamente só quando montado, sem tocar o `index.html`; hook `useGoogleLogin` invalida `['me']` no sucesso; botão com divisor "ou" em Login e Register (estilo dos cards existentes).

**Para ativar em produção** (checklist na seção 5): OAuth Client ID no Google Cloud Console + origins autorizadas + `GOOGLE_CLIENT_ID` (API) e `VITE_GOOGLE_CLIENT_ID` (build do web).

---

## 4. Validação executada

| Evidência | Resultado |
|---|---|
| `pnpm -r test` (shared+api+web) | **47/47 verdes** (api: 26 — incl. races paralelas, Google mockado nos 4 cenários, 409 único, 72 bytes, ids inválidos, JSON malformado, headers) |
| `tsc --noEmit` (api) | limpo |
| E2E no servidor dev real | register→me→start→guess→leaderboard→logout ✓ · **carName oculto em todos os estágios** · 404 estático · headers helmet vivos |
| Build web com env de teste | CSP injetada no index.html · **0 refs a imgur no bundle** (C1) |
| `pnpm audit --audit-level critical` | **0** críticos |
| Migration | `prisma migrate deploy` aplicada; schema sem drift |
| Área do agente de design | zero arquivos comuns; commit deles revalidado junto ao meu build (CSP e carNames intactos) |

---

## 5. Riscos residuais aceitos (documentados, não bloqueantes)

1. **Imagem original trafega para o cliente** (o blur é CSS client-side): um jogador pode, em tese, correlacionar imageUrls↔nomes ao longo de muitas rodadas. Mitigado por C1 (sem dicionário pronto no bundle) + limiters (farm caro) + validação server-side. Solução definitiva: blur/redução server-side da imagem — mudança de arquitetura sugerida como próximo passo.
2. **Registro não verifica posse do e-mail**: se alguém registrar o e-mail de terceiro ANTES do dono usar o Google login, o vínculo por e-mail funde as contas. Mitigado: Google atesta `email_verified` do lado de lá; impacto limitado (pontos/histórico, sem PII sensível). Solução definitiva: e-mail de verificação no registro (feature futura).
3. **braces <=3.0.3 (high, sem patch)** — cadeia do Tailwind 3, execução em build-time apenas. Sair do Tailwind 3 é área do design; acompanhar patch upstream.
4. **deepmerge-ts <8 (high)** — interno do CLI do Prisma (não-runtime); resolvido no Prisma 7.
5. uuid@9 e postcss-selector-parser (moderados) — cadeias build/CLI, sem input de usuário.
6. **Dev server** carrega o `.env` apenas no boot: o `tsx watch` reinicia em mudanças de `src/` mas NÃO em mudanças do `.env` (vale para `JWT_SECRET`, `GOOGLE_CLIENT_ID`, etc.). Após editar o `.env` da API, force um reload (salve qualquer arquivo em `src/` ou reinicie o `pnpm dev`). Em produção as variáveis vêm do host no boot — não há esse problema.

---

## 6. Checklist para produção

1. **API host** — variáveis: `NODE_ENV=production`, `DATABASE_URL` (SQLite→mesmo arquivo ou migra p/ Postgres quando quiser), `JWT_SECRET` novo e forte (`openssl rand -base64 48`; mínimo 32 chars, produção recusa os valores de exemplo), `CORS_ORIGIN=https://riuzim.github.io` (sem barra; múltiplos = separados por vírgula), `TRUST_PROXY` (nº de hops do seu host/proxy; vazio se direto), `GOOGLE_CLIENT_ID`.
2. **Google Cloud Console** → Credentials → Create OAuth Client ID (Web) → *Authorized JavaScript Origins*: `http://localhost:5173` (dev) e `https://riuzim.github.io` (prod). Use o mesmo Client ID na API e no build do web.
3. **GitHub Secrets**: `VITE_API_URL=https://<host-da-api>` e `VITE_GOOGLE_CLIENT_ID=<client id>`.
4. **Banco**: rodar `prisma migrate deploy` no host na primeira publicação.
5. A API precisa de **HTTPS** em produção (cookies `Secure` + `sameSite=none` já são automáticos via `NODE_ENV=production`).

---

*Arquivos alterados por esta revisão: apps/api (env, app, lib/auth, middleware/error, routes/auth, routes/rounds, routes/leaderboard, tests, prisma schema+migration+seed, .env.example), apps/web (Login, Register, useAuth, GoogleLoginButton novo, vite.config, .env.example novo), packages/shared (names.ts novo, cars.ts, index.ts, cars.test.ts novo), .github/workflows/deploy.yml, pnpm-lock.yaml. Nenhum arquivo visual/de gameplay do front foi tocado.*
