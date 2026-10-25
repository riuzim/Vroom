# Divulgação zero-custo — estado atual + manual de execução

> Plano de divulgação do Vroom gastando R$ 0. Este documento consolida: o que
> já está no ar, o que foi aplicado agora, o que resta fazer manualmente (com
> modelos prontos) e como medir resultados sem pagar analytics.

## 1. Infra no ar — custo mensal: R$ 0

| Peça           | Serviço       | Custo | URL                                            |
| -------------- | ------------- | ----- | ---------------------------------------------- |
| Site (SPA)     | GitHub Pages  | R$ 0  | https://riuzim.github.io/Vroom/                |
| API            | Render free   | R$ 0  | https://vroom-api-abci.onrender.com            |
| Banco Postgres | Supabase free | R$ 0  | (dashboard, região us-west-2)                  |
| Domínio        | —             | R$ 0  | subpasta `/Vroom/` do github.io (por enquanto) |

Limitações do free tier e como já estão mitigadas:

- **Render dorme após 15 min sem tráfego** (cold start de ~30-60s) →
  mitigado por [.github/workflows/keep-alive.yml](../.github/workflows/keep-alive.yml),
  que pinga a API a cada 10 min, de graça.
- **Supabase pausa o projeto após 7 dias sem atividade** (não autodesperta) →
  o mesmo workflow consulta o ranking (Postgres) e conta como atividade.
  Se um dia pausar mesmo assim: dashboard Supabase → botão Restore.
- **Banco 500 MB**: as ~103 fotos dos carros vivem no banco e ocupam
  dezenas de MB — folga enorme para o catálogo crescer.
- **GitHub desativa workflows agendados após 60 dias sem push**: se o
  keep-alive parar de rodar, reative em Actions → Keep-alive API.

## 2. Aplicado agora (neste pacote de mudanças)

1. **Preview social (Open Graph/Twitter)**: `apps/web/index.html` ganhou as
   metas `og:*` e `twitter:*` com URLs absolutas, e `apps/web/public/og.jpg`
   (1200×630, ~90 KB) — agora links no WhatsApp/Telegram/Discord mostram o
   pôster "Oficina Noturna" em vez de texto seco. O pôster é gerado por
   [`scripts/make-og-image.ps1`](../scripts/make-og-image.ps1) (foto real do
   catálogo desfocada + wordmark; rode de novo para trocar o carro de fundo).
2. **robots.txt + sitemap.xml passaram a sair no build**: o plugin já existia
   em `apps/web/vite.config.js`, mas faltava a variável. Agora
   [.github/workflows/deploy.yml](../.github/workflows/deploy.yml) define
   `VITE_SITE_URL` (default público = Pages atual; troque pelo secret
   quando houver domínio próprio).
3. **Sitemap inclui as rotas dos modos** (`/game/classic` … `/game/themed`):
   são as páginas com conteúdo real de jogo para quem chega por busca.
4. **Keep-alive** (item 1 acima).
5. **Este manual**.

## 3. Passos manuais — por ordem de retorno esperado

Tudo grátis. O botão **Compartilhar** do jogo já gera o share-grid estilo
Wordle (sem spoiler) com a URL do modo — é a sua principal arma.

1. **Círculo próximo (semana 1)**: poste o link no seu status do WhatsApp e
   em 2-3 grupos de amigos/carros que você frequenta de verdade. Peça para
   os amigos mandarem o resultado deles — o share-grid do jogo faz o resto.
2. **Reddit r/CarrosBR**: um único post honesto (modelo abaixo). Leia as
   regras da comunidade antes; responda comentários por horas. Não repostar.
3. **Grupos de Facebook/Telegram de carros**: mesma mensagem do WhatsApp,
   adaptando ao tom do grupo. Prefira grupos onde você já participa.
4. **TikTok/Reels/Shorts (maior alcance possível)**: um vídeo de 15-30s só de
   tela (roteiro abaixo). O formato reveal + "desafie alguém" funciona bem.
5. **Bio das suas redes**: link fixo com a tagline (modelo abaixo).
6. **Opcional — itch.io**: postar como web game gratuito (description + link
   externo) para descoberta orgânica; o site hospedado no Pages continua
   sendo o destino final.

### Modelos prontos para copiar

**WhatsApp/Telegram/status:**

```
Acabei de fazer 3/5 no Vroom 🏁 — jogo de adivinhar carro pela foto borrada.
Cada erro dá uma dica. Vê se você me supera:
https://riuzim.github.io/Vroom/game/daily
```

(mande o SEU share-grid do botão Compartilhar — formato `Vroom Daily #N`,
🟥/🟩, streak 🔥 e link — ele foi feito exatamente para isso.)

**Reddit r/CarrosBR:**

- Título: `Fiz um jogo grátis de adivinhar carros pela foto borrada (estilo Wordle, em pt-BR)`
- Corpo: hobby, sem anúncios, ~103 carros do Opala ao Aventador, 5 modos
  (Classic, Hard em P&B com 2x pontos, Daily do dia, Silhouette e Série
  temática), ranking global com conta, feedback bem-vindo em
  vroomfeedback@gmail.com ou issues no GitHub. + link do site.

**Roteiro de vídeo TikTok/Reels (15-30s, só gravação de tela):**

1. 0-3s: tela do Daily totalmente borrada — legenda "Adivinha esse carro em 5 chutes"
2. 3-15s: dois chutes errados; mostrar as dicas aparecendo (letra + nitidez)
3. 15-25s: acerto → reveal do carro nítido + toast de pontos
4. 25-30s: share-grid na tela — "chama o amigo que não acerta nem um Uno 👇"

- Legenda: `Nível: difícil 🏁 link na bio` + #carros #jogos #wordle

**Bio de redes sociais:**

```
🏁 Adivinhe o carro pela foto borrada — 5 chutes, dica a cada erro.
Grátis: https://riuzim.github.io/Vroom/
```

## 4. Medir sem pagar analytics (seu banco já é o analytics)

Nenhuma ferramenta externa ativa (e o banner de cookies deixa isso claro).
Supabase dashboard → SQL Editor → cole:

```sql
-- Rodadas e jogadores logados por dia (últimos 14 dias)
SELECT "startedAt"::date AS dia,
       count(*)                          AS rodadas,
       count(DISTINCT "userId")          AS jogadores_logados
FROM "Round"
WHERE "startedAt" >= now() - interval '14 days'
GROUP BY 1 ORDER BY 1;

-- Rodadas do Daily por dia (o termômetro da divulgação)
SELECT "dailyDate" AS dia, count(*) AS rodadas
FROM "Round"
WHERE mode = 'daily'
GROUP BY 1 ORDER BY 1 DESC LIMIT 14;

-- Taxa de acerto por modo
SELECT mode,
       count(*) FILTER (WHERE status = 'correct') AS acertos,
       count(*)                                   AS rodadas,
       round(100.0 * count(*) FILTER (WHERE status = 'correct')
             / count(*), 1)                        AS taxa_acerto
FROM "Round"
GROUP BY mode ORDER BY rodadas DESC;
```

Observações: rodadas de convidado têm `userId` nulo — use o total de
rodadas como termômetro de tráfego; o GitHub Actions do keep-alive
funciona de graça como alarme de uptime (run vermelha = API fora do ar).
Quando passar de ~1.000 visitas/dia, vale considerar o GoatCounter
(grátis para não-comercial) — exigiria liberar o domínio dele na CSP e o
banner de consentimento já existe.

## 5. AdSense — por que NÃO agora (decisão assentada)

- **Pré-requisitos ainda não atendidos**: AdSense exige domínio próprio
  (github.io não é aceito como site desde 2024) e tráfego. Domínio
  ~R$ 40/ano (.com.br no registro.br) quando a hora chegar.
- **Números realistas**: RPM Brasil para jogo casual ~US$ 4/1.000
  pageviews; em escala hobby (500-5k visitas/mês) = **US$ 0,20-2/mês** —
  o saque mínimo de US$ 100 levaria anos. Pix/doação rende mais nessa
  escala.
- **A infra já está pronta**: `AdSlot`, `ads.txt` e CSP condicionais são
  ativados só de definir `VITE_ADSENSE_CLIENT` no deploy — nada a
  programar no futuro.
- **js.org** (vroom.js.org) é um domínio grátis para marca/short-link,
  mas NÃO resolve AdSense (exige domínio raiz próprio).

## 6. Gatilhos para escalar (na ordem em que ficarem verdade)

| Gatilho                                | Ação                                                         |
| -------------------------------------- | ------------------------------------------------------------ |
| ~500 visitas/dia sustentadas           | Comprar domínio (R$ 40/ano), trocar `VITE_SITE_URL`, OG tags |
| Domínio + conteúdo + tráfego           | Candidatar-se ao AdSense (infra já pronta)                   |
| Memória/cold start do Render apertando | Migrar API para Fly.io (~US$ 2/mês) — ver docs/deploy.md     |
| Qualquer momento                       | Backup mensal do banco (abaixo)                              |

**Backup mensal (grátis — Supabase free não tem backup automático):**

```bash
# instale a CLI do Supabase uma vez: https://supabase.com/docs/guides/cli
# connection string: dashboard Supabase → Connect → URI (substitua a senha)
supabase db dump --db-url "postgres://postgres:[SENHA]@db.[PROJETO].supabase.co:5432/postgres" -f vroom-$(date +%F).sql
```

Guarde o `.sql` em nuvem grátis (Drive/OneDrive). O restore é um
`psql -f` no banco novo.

---

Resumo executivo: **hospedagem R$ 0, divulgação R$ 0, tudo já no ar.**
O trabalho restante é o item 3 (postar, com os modelos acima) e medir
com as queries do item 4. Dinheiro só entra na conversa quando o tráfego
provar que vale (item 6).
