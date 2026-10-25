# Vroom em produção — domínio próprio + AdSense + LGPD

Guia de como colocar o Vroom em um servidor com URL própria e monetizar com
Google AdSense sem violar LGPD, cookies ou as políticas do Google. Siga a
ordem — aprovação do AdSense reprova site sem política de privacidade.

## 0. Arquitetura alvo

```
 navegador → https://vroom.example.com  (Caddy: SPA dist + fallback index.html)
                        └── /api/* → http://localhost:4000 (apps/api)
```

Front e API no **mesmo site** (`vroom.example.com` ↔ `api.vroom.example.com`
contam como mesmo site para SameSite) → cookie de sessão pode usar
`SameSite=Lax` (mais seguro que `None`).

## 1. Variáveis de ambiente

### `apps/web/.env` (no servidor de build)

| Var                     | Valor em produção                                                                            |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| `VITE_API_URL`          | `https://api.vroom.example.com` — ou vazio se o Caddy fizer proxy de `/api` no mesmo domínio |
| `VITE_GOOGLE_CLIENT_ID` | igual ao da API (adicione a origem nova no Google Cloud Console)                             |
| `VITE_BASE`             | `/` (raiz do domínio; vazio mantém `/Vroom/` do GitHub Pages)                                |
| `VITE_SITE_URL`         | `https://vroom.example.com` (gera robots.txt + sitemap.xml no build)                         |
| `VITE_ADSENSE_CLIENT`   | `ca-pub-…` **só depois da conta AdSense APROVADA** (habilita AdSlots, CSP e ads.txt)         |

### `apps/api/.env`

| Var                | Valor em produção                                                                                                                                  |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`     | URI Postgres do **Supabase Session pooler** (`postgresql://postgres.<ref>:<senha>@aws-0-<região>.pooler.supabase.com:5432/postgres`) — veja abaixo |
| `NODE_ENV`         | `production` (exige JWT_SECRET 32+ caracteres real)                                                                                                |
| `JWT_SECRET`       | `openssl rand -base64 48`                                                                                                                          |
| `CORS_ORIGIN`      | `https://vroom.example.com` (+ `https://riuzim.github.io` se mantiver o Pages)                                                                     |
| `TRUST_PROXY`      | `1` (atrás do Caddy, para o rate-limit ver o IP real)                                                                                              |
| `GOOGLE_CLIENT_ID` | igual ao do front                                                                                                                                  |
| `COOKIE_SAMESITE`  | `lax` (mesmo site com o front) — vazio/`none` só se front e API em sites distintos                                                                 |

### Postgres de produção (Supabase)

O Vroom usa **só o banco** do Supabase — sem Storage, sem Auth, sem SDK: a
API continua Express + Prisma + JWT próprio.

1. Crie o projeto em <https://supabase.com> (região próxima dos usuários).
2. Em **Connect → Session pooler**, copie a URI
   (`postgresql://postgres.<project-ref>:<senha>@aws-0-<região>.pooler.supabase.com:5432/postgres`)
   e use como `DATABASE_URL`.
   **Use o Session pooler, não a conexão direta**: no plano free a conexão
   direta só aceita IPv6, e a maioria dos hosts (e redes domésticas) é IPv4.
3. No primeiro deploy, aplique o schema e o catálogo **uma vez**:
   ```bash
   DATABASE_URL='<uri do pooler>' pnpm --filter @vroom/api db:deploy
   DATABASE_URL='<uri do pooler>' pnpm --filter @vroom/api db:seed
   ```
   (a seed é 100% offline — as imagens vêm do repo.)
4. Aponte o `DATABASE_URL` do runtime para o mesmo pooler.

> ⚠️ Plano free do Supabase **pausa o projeto após ~1 semana sem tráfego**
> (despausa sozinho no próximo acesso, com atraso). Para um jogo com público
> esparso, considere o [Neon](https://neon.tech) (free não pausa) — a troca é
> só trocar a `DATABASE_URL`, o resto é Postgres puro.

## 2. Caddy (HTTPS automático + fallback SPA + proxy /api)

```Caddyfile
vroom.example.com {
	encode zstd gzip

	# SPA: tenta o arquivo real no dist; se não existir, cai no index.html
	# (necessário por causa do BrowserRouter).
	root * /srv/vroom/apps/web/dist
	try_files {path} /index.html
	file_server

	# API no mesmo domínio — dispensa CORS e mantém tudo same-site.
	handle_path /api/* {
		reverse_proxy localhost:4000
	}
}

api.vroom.example.com {
	# (opcional) API também exposta em subdomínio próprio
	reverse_proxy localhost:4000
}
```

Build + deploy:

```bash
pnpm install
pnpm build                # web (dist/) + api (dist/) + shared
pnpm --filter @vroom/api db:deploy   # prisma migrate deploy (Supabase via DATABASE_URL)
# PRIMEIRO deploy somente: pnpm --filter @vroom/api db:seed  (catálogo, uma vez)
# apps/api: NODE_ENV=production pm2 start dist/index.js (ou systemd)
```

Depois do deploy, verifique: `/robots.txt`, `/sitemap.xml` e (quando ativar o
AdSense) `/ads.txt` respondendo 200. A CSP continua vindo da meta tag
injetada pelo build (ver `apps/web/vite.config.js`).

## 3. Passos externos — AdSense (na ordem, sem dor de cabeça)

1. **Conta**: [adsense.google.com](https://adsense.google.com) → Inscrever-se
   (18+, CPF, endereço para o PIN dos Correios).
2. **Adicionar o site** na raiz do domínio e aguardar a revisão (dias a ~2
   semanas). O site precisa estar ao ar com as páginas legais no rodapé.
3. **CMP gratuito do Google** (obrigatório p/ EEA/UK/Suíça): AdSense →
   **Privacidade e mensagens** → ativar a mensagem GDPR. A partir daí o
   banner próprio do Vroom se omite nessas regiões (detecta `__tcfapi__`).
4. **Pagamento**: AdSense → Pagamentos → transferência (EFT) para conta
   bancária brasileira; limite de US$ 100/mês; PIN chega pelos Correios ao
   passar de ~US$ 10; informe o CPF nas informações fiscais.
5. **Ligar anúncios**: com a conta aprovada, preencha `VITE_ADSENSE_CLIENT`
   no `.env` do build e re deploy. O AdSense só renderiza com consentimento
   de publicidade (LGPD) e o `ads.txt` sai no dist automaticamente.
6. **Conferir**: AdSense → Sites (status "Pronto"), → **Central de políticas**
   sem violações, e `https://.../ads.txt` visível.

## 4. Regras permanentes (evitam ban/infração)

- **Nunca** clique nos próprios anúncios nem peça cliques (nem no Discord) —
  ban é definitivo, e invalid traffic derruba a conta.
- **Nunca** mova `<AdSlot>` para a tela de jogo ou para perto de botões/input
  (política de cliques acidentais em páginas de jogo). Slots atuais:
  Home, Ranking e Perfil.
- Sempre que adicionar script de terceiros (ex.: GA4), passe pelo gate do
  consentimento (`apps/web/src/lib/consent.js`) e atualize
  `/privacidade` e `/cookies` na mesma PR.
- Créditos das fotos são obrigatórios (CC BY/BY-SA): a página `/creditos` é
  gerada de `levantamento/catalogo-vroom.json` via
  `scripts/gen-car-credits.mjs`. Para regenerar SÓ os créditos:
  `node scripts/gen-car-credits.mjs`. O comando completo `pnpm catalog`
  revalida e regrera tudo, mas exige o levantamento fechado em exatamente
  200 carros (`scripts/build-catalog.mjs` aborta fora disso).
- Atualize as datas no topo das páginas legais ao alterar os textos.

## 5. Checklist final de aceite

- [ ] Site no ar com HTTPS na raiz do domínio; rotas profundas recarregam (fallback SPA).
- [ ] Rodapé com Privacidade · Termos · Cookies · Créditos.
- [ ] Banner LGPD aparece no Brasil; NÃO aparece com CMP do Google ativa (testar com VPN UE).
- [ ] Cookie de sessão com `SameSite=Lax; Secure; HttpOnly` (confira no DevTools).
- [ ] `/robots.txt` e `/sitemap.xml` OK.
- [ ] Conta AdSense aprovada; `/ads.txt` OK; Central de políticas limpa.
- [ ] `pnpm lint` e `pnpm -r test` verdes; build sem erros de CSP no console.
