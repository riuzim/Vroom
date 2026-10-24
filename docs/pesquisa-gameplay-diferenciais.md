# Vroom — Pesquisa de estilos e tipos de jogos: diferenciais, retenção diária e diferenciação competitiva

> Pesquisa realizada em out/2026 a partir do repositório atual do Vroom (monorepo `apps/web` + `apps/api` + `packages/shared`) e de fontes públicas: catálogos do ecossistema "dle", sites dos concorrentes diretos, artigos de design/retenção de jogos diários e dados divulgados por Duolingo, NYT Games e chess.com.
>
> **Escopo:** análise e recomendações. Nenhuma implementação de código foi feita.

---

## 1. Sumário executivo

O Vroom já tem o núcleo certo: um daily visual (foto que clareia a cada chute), rápido de jogar, com anti-cheat server-authoritative e ranking global. O problema é que ele compete sozinho contra **hubs** — DailyCarQuiz.com (12 jogos de carro) e REVVED (3 jogos + Garage + ranks + archive) — e não tem **nenhuma mecânica de retorno**: sem streak, sem share-grid, sem archive, sem coleção, sem stats.

As evidências coletadas apontam um caminho claro:

1. **Antes de novos modos, mecânicas de retorno.** Share-grid emoji sem spoiler é o growth hack comprovado do Wordle (crescimento hockey-stick após adicionar em dez/2021). Streak de 7 dias = 2,4× mais chance de retorno no dia seguinte (Duolingo). Mas streak sozinho pune o ausente — o par **streak + archive** é a combinação vencedora ("o que você perdeu continua aqui").
2. **A primeira sessão precisa terminar em vitória.** A métrica nº 1 de um daily é a fração de primeiras sessões resolvidas; quem resolve no dia 1 volta muito mais (lição do criador de dles Andy Stanly). O Vroom já é guest-friendly (bom — signup wall mata primeiras sessões); falta calibrar dificuldade de entrada.
3. **Novos modos baratos que aproveitam o que já existe na stack:** silhueta (imagem já está no banco — basta tratar), ordenação por ano (campo `years` já existe), séries temáticas por `category` (JDM, muscle, hypercars). Provas de mercado: REVVED "Spotted" (silhueta) e "Cranked" (ordenar 5 carros), Framed (modos por tipo de pista), DailyCarQuiz (modos por nicho).
4. **A grande aposta de médio prazo:** enriquecer o catálogo (specs, país, potência) para um modo ficha-técnica — o formato comprovado do Cardle.sh Classic — e, principalmente, um **posicionamento brasileiro**: nenhum concorrente direto atende o público pt-BR nem os carros da cultura local (Uno, Gol, Opala, Chevette…). O i18n do Vroom (pt-BR/en/es) é um ativo sem par no nicho.
5. **O que não fazer:** notificações push, timers, tutoriais e PvP em tempo real agora — todos contraproducentes ou prematuros pelas evidências (Wordle: "compromisso limitado"; Squabble exige infra e massa crítica que o Vroom ainda não tem).

Roadmap sugerido: **Fase 1** (quick wins de 0–30 dias: share-grid, streak, stats, silhueta, séries rotativas) → **Fase 2** (archive, Garage/coleção, duelo assíncrono de amigo, ordenação, curadoria Brasil) → **Fase 3** (SpecDle com catálogo enriquecido, quests, liga/temporada).

---

## 2. O Vroom hoje (baseline)

| Dimensão | Estado atual |
|---|---|
| Core loop | Adivinhar o carro por foto que clareia a cada chute errado + 1 letra revelada por erro; 5 tentativas |
| Pontuação | 10 × tentativas restantes (2× no Hard) |
| Modos | Classic (livre), Hard (P&B, 2×), Daily (1/dia, mesmo carro para todos, `@@unique([userId, dailyDate])`) |
| Social/retorno | **Nenhum** — sem streak, share-grid, archive, coleção, quests, notificações ou stats |
| Contas | Visitante joga (não pontua); ranking global só para contas — padrão correto (sem signup wall) |
| Anti-cheat | Server-authoritative; nome nunca sai do payload antes do fim (coberto por teste) |
| Catálogo | ~120 carros (Wikimedia Commons), `Car{name, brand, model, category, years, imageData Bytes…}`; **sem specs** (combustível, tração, potência, preço, país) |
| Stack | React 18 + Vite (web), Express + Prisma + Postgres (API), i18n pt-BR/en/es, imagens BYTEA servidas pela própria API |
| Monetização | AdSense + consent de cookies; sem tier pago |

**Conclusão do baseline:** o custo de jogo é baixo e a sessão é curta (bom, pela evidência de Wordle/Stanly). O gargalo não é o core — é tudo ao redor dele (retenção, social, profundidade de catálogo).

---

## 3. O ecossistema "dle" (macro-cenário)

- [aukspot/dles](https://github.com/aukspot/dles): lista curada de **700+ jogos diários** em 17 categorias, atualizada continuamente. Definição de "dle": muda todo dia, **mesma versão para todos**, inspirado em Wordle, **grátis e sem login** — o padrão de UX que o público do nicho espera.
- [listdle.com](https://listdle.com): catálogo com categorias populosas: Trivia 74, Geography 83, Price 16 etc. — sinal de demanda por variedade temática.
- [playlin.io](https://playlin.io): diretório curado ("where daily games live") — **canal de distribuição**: jogos são avaliados manualmente antes de listar; o REVVED é "featured" lá. Vale submeter o Vroom quando tiver share + stats.

**Nichos relevantes para o Vroom dentro do ecossistema:**

| Nicho | Tamanho/sinais | Exemplos |
|---|---|---|
| Estimativa/Comparação | ~33 jogos (um dos maiores nichos) | Magnitudle, Size It Up, Its Price, Tall Ordle (ordena "fastest cars"), More/Less binário |
| Ordenação temporal | Categoria History cheia de jogos de ordenar | Chronle, Timdle, Wikitrivia, Chrono, TimeGuessr |
| Adivinhação visual revelada | Formato dominante em filmes (Framed), carros (Cardle), música (album covers) | Framed, Cardle, Heardle-likes |

**Leitura:** há demanda comprovada por modos de (a) estimativa "mais ou menos" (potência/preço/0–100), (b) ordenação por ano/velocidade, (c) revelação progressiva de pistas visuais — exatamente os formatos que o Vroom pode construir com o que já tem (`years`) ou com enriquecimento de catálogo.

---

## 4. Cenário competitivo direto (jogos diários de carro)

### 4.1 DailyCarQuiz.com — o hub de referência

[Daily Car Quiz](https://dailycarquiz.com) é a competência mais completa: **12 jogos** sob o mesmo teto — Cardle (foto), **RevQuiz** (som do motor: marca/modelo/ano, 5 chutes, replay à vontade), AutoGram (word game), **CarConnections** (puzzle **semanal**), AutoAsk (20 perguntas), Supercardle, Eurodle (europeus), Muscledle (muscle cars), JDMdle (JDM), CarTrivia e Carcade (arcade). Tem **Leaderboard, Archive, perfil e Pricing (tier premium)**, mais presença ativa em Instagram/YouTube/TikTok.

**Estratégias a copiar:** hub de modos (cada modo é uma porta de entrada), modos por nicho, cadência semanal complementar à diária (CarConnections), monetização premium, conteúdo social diário.

### 4.2 Cardle (cardle.sh) — o specs-dle

[cardle.sh](https://cardle.sh) roda **300+ carros** com 3 modos: **Classic** (ficha técnica), Image (foto que revela — mesmo core do Vroom) e Emoji (marca por emojis). O modo Classic é o formato specs mais bem documentado do nicho:

- Cada chute revela tiles: **Fuel** (Gasolina/Diesel/Híbrido/Elétrico/LPG…), **Car Type** (multi-valor: Sedan, Coupé, Supercar, Hypercar, SUV…), **Drive Wheel** (4WD/FWD/RWD), **Engine Config** (Straight-2…8, V6–V16, W8–W16, Flat-2…12, VR5/6, Elétrico), **Brand**, **Year** com **setas ↑/↓** (o ano certo é maior ou menor?).
- Cores: verde = match exato, laranja = parcial (interseção de tipos), vermelho = sem interseção.
- Meta: **Win Streak com animação de fogo**, **Archive em calendário** (Won/Played/Not played/**"Premium required"** — archive antigo é paywall), contador social "N people already found out", rotação à meia-noite UTC.

**Estratégias a copiar:** streak + archive (com monetização do arquivo), contador de "quantos acertaram hoje", formato specs com setas. **Cuidado:** sem enriquecimento de catálogo o Vroom não consegue replicar o modo Classic — o catálogo é o fosso.

### 4.3 REVVED (playrevved.com) — o hub mais parecido com o que o Vroom deveria ser

[REVVED](https://playrevved.com) (de Nic Sullo, featured no Playlin) é um hub de **3 jogos diários de carro**:

- **Revved** — "Hear the car. Name it." (som do motor, 6 chutes, pistas estreitam o campo)
- **Cranked** — "Five cars. One correct order." (jogo de **ordenação**)
- **Spotted** — "See the shape. Name the car." (**silhueta**)

Com **Ranks** (leaderboard), **Stats**, **Garage** (coleção!) e **Archive**. 

**Leitura estratégica:** REVVED prova que silhueta e ordenação sustentam modos próprios em carro — e que "Garage" (coleção) é a camada de progressão esperada do nicho. O Vroom pode implementar equivalentes **sem nenhum asset novo** (imagens já estão no banco; `years` já existe no schema).

### 4.4 Clones menores

"Cardle" em agregadores (wordly.org, wordleverse.net): foto + mais pistas por chute errado — mesmo core do Vroom, sem meta-game. Não são ameaça estrutural, mas diluem o nome "Cardle".

### 4.5 Tabela comparativa

| Recurso | Vroom | DailyCarQuiz | cardle.sh | REVVED |
|---|:---:|:---:|:---:|:---:|
| Daily visual (foto) | ✅ | ✅ (Cardle) | ✅ (Image) | — |
| Modo specs/ficha técnica | — | — | ✅ | — |
| Modo som | — | ✅ (RevQuiz) | — | ✅ (Revved) |
| Modo silhueta | — | — | — | ✅ (Spotted) |
| Modo ordenação | — | — | — | ✅ (Cranked) |
| Modos por nicho (JDM etc.) | — | ✅ | — | — |
| Puzzle semanal | — | ✅ (CarConnections) | — | — |
| Streak | — | ✅ | ✅ (com fogo) | ✅ |
| Archive | — | ✅ | ✅ (premium p/ antigos) | ✅ |
| Stats | — | ✅ | — | ✅ |
| Coleção/Garage | — | — | — | ✅ |
| Leaderboard | ✅ | ✅ | — (contador apenas) | ✅ (Ranks) |
| Share-grid | — | — | — | — |
| Duelo entre amigos | — | — | — | — |
| i18n | ✅ pt-BR/en/es | EN | EN (seletor 🇬🇧) | EN |
| Premium | — | ✅ | ✅ | — |

**Os dois buracos verdes da matriz:** share-grid emoji e duelo assíncrono de amigo — ninguém no nicho tem. São justamente os de menor esforço.

---

## 5. Playbook de retenção diária — o que a evidência mostra

### 5.1 Wordle: escassez + simplicidade + compromisso limitado + share

[Análise da The Hard Copy](https://thehardcopy.co/wordles-viral-success-is-based-on-design/) (jan/2022) sobre o crescimento 90 → 300 mil jogadores (artigo troca os anos; o período real é nov/2021 → jan/2022, chegando a ~2M depois), 100% orgânico. Três fatores do criador Josh Wardle:

1. **Escassez** — 1 desafio/dia;
2. **Simplicidade** — UI sem distração;
3. **Compromisso limitado** — sem notificações; o jogo pede minutos, não horas.

E o growth hack acidental: **share-grid emoji sem spoiler**, adicionado em dez/2021 → crescimento hockey-stick. Funciona por *common knowledge*: só quem jogou decodifica o grid, e todos jogam o MESMO puzzle do dia — ver o resultado de um amigo (a) lembra que o board de hoje existe (retenção!) e (b) cria curiosidade nos que ainda não jogaram (aquisição). O grid precisa ser legível **sem explicação**.

### 5.2 Streak: potente, mas não salva produto fraco

- [Duolingo — Improving the Streak](https://blog.duolingo.com/improving-the-streak/): quem chega a streak de 7 dias tem **2,4× mais chance de usar o app no dia seguinte**.
- [Duolingo — How Streaks Keep Learners Committed](https://blog.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals/): streak = motivação por consistência; perder 1 dia zera — poderoso e punitivo ao mesmo tempo.
- [Behind the Product: Duolingo Streaks (Lenny's Newsletter, com o PM de Retenção do Duolingo)](https://www.lennysnewsletter.com/p/behind-the-product-duolingo-streaks): **streaks amplificam um produto com valor inerente; não substituem valor.** Construa o retorno primeiro, o streak depois.
- [NYT Games lançou Stats & Streaks para Connections](https://www.nytimes.com/2024/09/03/business/media/connections-wordle-new-york-times-games.html) (set/2024) — mesmo o dono do Wordle investe em streak/stats quando quer fidelizar.

### 5.3 Archive > streak sozinho

[Andy Stanly — Why a daily puzzle needs an archive, not a streak](https://dev.to/andystanly/why-a-daily-puzzle-needs-an-archive-not-a-streak-344i): o streak **pune o comportamento errado** — quem mais se importa é quem não pode jogar todo dia; ao quebrar o streak, o jogador não recomeça, abandona. O archive diz "o que você perdeu continua aqui" e torna o primeiro dia de volta um prazer. **A combinação que funciona: streak para quem quer pressão + archive para quem quer conteúdo** (lista de boards passados com reveal opcional da resposta — não um feed nem um leaderboard). Framed ("Play the days you missed"), Cardle (calendário premium) e REVVED implementam exatamente isso.

### 5.4 A primeira sessão precisa terminar em vitória

[Andy Stanly — Retention lessons from building a daily puzzle](https://dev.to/andystanly/retention-lessons-from-building-a-daily-puzzle-the-streak-is-not-the-feature-2af9): o streak **não cria** primeira visita — ele recompensa consistência que já existe. O que gera retorno: puzzle **solúvel em uma sessão** (~3 min no celular). Métrica-chave: **fração de primeiras sessões terminando em vitória** — quem resolve no dia 1 volta muito mais. O que cortar: signup wall (o Vroom já acertou deixando visitante jogar), tutoriais e **timers** (ansiedade reduz retorno).

### 5.5 Progressão por habilidade e comunidade

- [chess.com — Puzzle Ratings](https://support.chess.com/en/articles/8602396-how-do-puzzle-ratings-work) e o [novo sistema de rating de puzzles](https://www.chess.com/news/view/announcing-new-puzzles-rating-system): rating sobe/desce conforme a dificuldade do puzzle vs. sua rating — **desafio personalizado** é retentivo para o hardcore.
- [Squabble (battle royale do Wordle, Polygon, fev/2022)](https://www.polygon.com/22934727/wordle-squabble-against-other-people-battle-royale/): prova que o público de dles aceita **competição direta** — mas era tempo real (websockets, salas), infra que o Vroom não precisa pagar hoje: o **duelo assíncrono** (o mesmo carro do dia, quem acerta em menos chutes) entrega o mesmo desejo sem infra nova.
- [Framed](https://framed.wtf): além do Classic (6 frames), tem One Frame, Titleshot, Poster, Archive, Stats, **Oscars (resultados da comunidade)** e loja de merch — template de como um daily visual expande em modos por tipo de pista.

---

## 6. Candidatos de novos modos e mecânicas (fit × esforço × impacto)

Avaliação relativa à stack atual (React+Vite / Express+Prisma+Postgres, imagens BYTEA, ~120 carros com `name/brand/model/category/years`).

### A. Mecânicas de retorno (cross-cutting — vêm antes de modos novos)

| # | Candidato | O que é | Precedente | Esforço | Impacto |
|---|---|---|---|:---:|:---:|
| A1 | **Share-grid emoji** | Grid sem spoiler (ex.: `Vroom #57 🟥🟨🟩🟩🟩🚗 4/5`) copiável ao terminar | Wordle (hockey-stick); ninguém no nicho de carros tem | **Baixo** (front-end + clipboard) | **Alto** (crescimento + retenção) |
| A2 | **Streak diário + destaque no perfil** | Contagem de dailies consecutivos, com "melhor streak" | Cardle (fogo animado), NYT, Duolingo (2,4×) | **Baixo/Médio** (tabela `UserStreak` ou derivação de `Score`) | **Alto** |
| A3 | **Página de Stats** | Distribuição de chutes, % vitória, streaks, histórico pessoal | NYT Connections, REVVED, Framed | **Baixo/Médio** (dados já existem em `Score`/`Round`) | **Médio** |
| A4 | **Archive de dailies** | Jogar dias passados, com reveal opcional da resposta | Andy Stanly; Framed "Play the days you missed"; Cardle (paywall) | **Médio** ⚠️ depende do registro histórico do carro do dia (ver nota) | **Médio/Alto** |
| A5 | **Duelo assíncrono de amigo** | Link "desafio do dia": mesmo carro, quem acerta em menos chutes; placar 1:1 | Squabble (real-time); **gap no nicho de carros** | **Médio** (token de round + rota de replay) | **Alto** (viral 1:1, sem infra nova) |

> **Nota técnica (A4):** o archive exige saber qual carro foi o daily de cada data passada. Verificar se a seleção do carro do dia é **determinística** (ex.: seed pela data sobre o catálogo, em `packages/shared`) — se for, o archive é derivável de graça; se não for, criar `DailyCar{date, carId}` registrando o carro de cada dia **a partir de agora** (o passado não é recuperável).

### B. Novos modos de jogo

| # | Candidato | O que é | Precedente | Esforço | Impacto |
|---|---|---|---|:---:|:---:|
| B1 | **Modo Silhueta** ("Spotted"-like) | Silhueta preta do carro; chutes revelam detalhes/foto | REVVED Spotted | **Baixo** (imagens já no banco; silhueta = filtro/processamento no servidor ou CSS) | **Médio** |
| B2 | **Modo Ordenação** ("Cranked"-like) | 5 carros, ordenar por ano (depois: potência/preço com catálogo rico) | REVVED Cranked; Chronle/Tall Ordle no ecossistema | **Baixo/Médio** (`years` já existe!) | **Médio** |
| B3 | **Séries temáticas rotativas** | "Fim de semana JDM", "Semana hypercars" — daily filtrado por `category` | DailyCarQuiz (JDMdle/Muscledle/Eurodle como jogos fixos) | **Baixo** (campo `category` existe; é um filtro + agenda) | **Médio** |
| B4 | **Modo Specs (ficha técnica)** | Chutes revelam tiles: país, tração, motor, potência, ano com setas ↑↓ | cardle.sh Classic (formato comprovado); nicho estimação (33+ dles) | **Alto** ⚠️ exige enriquecer catálogo com specs | **Alto** |
| B5 | **Modo "Mais ou Menos"** | Comparação binária: "potência/preço/0–100 do carro X é maior ou menor?" | Its Price, Magnitudle, Size It Up (nicho de 33 jogos) | **Médio** (subconjunto de B4 — mesmos campos de catálogo) | **Médio/Alto** |
| B6 | **Modo Som (motor)** | Adivinhar pelo som | REVVED Revved; DailyCarQuiz RevQuiz | **Alto** (assets de áudio + licenças + storage) | **Médio** (nicho já dominado — seriamos seguidores) |
| B7 | **Modo Emoji** | Marca por emojis | cardle.sh Emoji | **Baixo** (mapear emojis por marca) | **Baixo/Médio** (gimmick) |
| B8 | **Modo Brasil** | Daily da cultura carros BR (Uno, Gol, Opala, Chevette, Kombi…) — curadoria + destaque | **Nenhum concorrente atende** pt-BR | **Médio** (curadoria de catálogo Wikimedia BR) | **Alto** para o público-alvo |
| B9 | **Practice/Unlimited** | Rodadas infinitas fora do daily (sem valer streak/ranking) | Krillion/Unlimited-likes; citado por Stanly | **Baixo/Médio** (o modo Classic já é isso — formalizar UX "treino") | **Médio** |

### C. Meta-jogo e progressão

| # | Candidato | O que é | Precedente | Esforço | Impacto |
|---|---|---|---|:---:|:---:|
| C1 | **Garage/Coleção + raridade** | Carros "conquistados" ao acertar, com tiers de raridade (comum→lendário por dificuldade/popularidade) | REVVED "Garage"; "rarity tiers are a promise" (Stanly) | **Médio** (tabela coleção + UI) | **Alto** (colecionável = retorno) |
| C2 | **Conquistas** | Badges: "primeiro daily", "10 streak", "acertou em 1 chute"… | Padrão de mobile games (ACM 10.1145/3341215.3356261) | **Médio** | **Médio** |
| C3 | **Quests diárias/semanais** | 3 metas: "jogue o daily", "acerte um Hard", "ganhe um duelo" | Padrão battle pass; valida visitas não-daily | **Médio** | **Médio** |
| C4 | **Liga/Temporada** | Grupos mensais (Bronze→Diamante) com promoção/rebaixamento | Duolingo Leagues, chess.com ratings | **Alto** ⚠️ precisa massa crítica de jogadores | **Alto** (mas prematuro) |
| C5 | **Puzzle semanal** | Desafio maior de domingo (ex.: 3 carros ligados por uma tema) | CarConnections (DailyCarQuiz) | **Médio** | **Médio** |

### D. Conteúdo e monetização

| # | Candidato | Notas | Esforço |
|---|---|---|---|
| D1 | **Expandir catálogo** | cardle.sh tem 300+; Vroom ~120. Mais catálogo = mais re-jogabilidade e dificuldade calibrada | Contínuo |
| D2 | **Enriquecer catálogo (specs)** | Pré-requisito de B4/B5: país, tração, motor, potência, preço (nullable, migrar `Car`) | Alto (dados), destrava a aposta principal |
| D3 | **Premium** | Precedente: Cardle paywalla o archive antigo; DailyCarQuiz tem tier pago. Caminhos: archive estendido, cosmetics de Garage, séries extras. Manter daily gratuito (padrão do ecossistema) | Médio |
| D4 | **Playlin/dles** | Submeter ao [playlin.io](https://playlin.io) e ao [dles](https://github.com/aukspot/dles) após ter share-grid + stats — canal de distribuição gratuito | Baixo |

---

## 7. Matriz impacto × esforço e roadmap

### Matriz

|  | **Impacto alto** | **Impacto médio** | **Impacto baixo** |
|---|---|---|---|
| **Esforço baixo** | 🥇 A1 Share-grid · A2 Streak · B3 Séries temáticas | A3 Stats · B1 Silhueta · B7 Emoji · B9 Practice | — |
| **Esforço médio** | 🥈 A5 Duelo assíncrono · C1 Garage | A4 Archive · B2 Ordenação · B8 Modo Brasil · C2 Conquistas · C3 Quests | C5 Puzzle semanal |
| **Esforço alto** | 🥉 B4 Specs · D2 Enriquecer catálogo · C4 Liga | B5 Mais ou Menos · B6 Som | — |

### Roadmap sugerido

**Fase 1 — Fundação de retorno (0–30 dias)**
1. A1 Share-grid emoji sem spoiler (botão "Compartilhar" pós-round, clipboard, spoiler-free)
2. A2 Streak diário com destaque no perfil (streak atual + melhor)
3. A3 Página de Stats (reutiliza `Score`/`Round`)
4. B1 Modo Silhueta como modo do dia alternativo ou quarto modo
5. B3 Séries temáticas rotativas por `category` (FDS JDM, semana hypercars)
6. Medir: % de primeiras sessões com vitória, D1/D7, share rate

**Fase 2 — Profundidade e social (1–3 meses)**
1. A4 Archive (começar a registrar `DailyCar{date, carId}` desde já, mesmo que a UI venha depois)
2. A5 Duelo assíncrono por link (token de round; funciona para guest também)
3. C1 Garage/coleção com tiers de raridade
4. B2 Modo ordenação por ano (depois por potência, quando B4 existir)
5. B8 Curadoria "Vroom Brasil" (catálogo BR + destaque pt-BR)

**Fase 3 — Apostas de diferenciação (3–6 meses)**
1. D2+B4/B5 Enriquecer catálogo → modo Specs com setas → modo Mais ou Menos
2. C3 Quests diárias (agora com modos suficientes para variar metas)
3. C2 Conquistas; C4 Liga/temporada (só com massa crítica de DAU)
4. D3 Premium (archive estendido/cosmetics) + D4 submissão a playlin/dles

### O que NÃO fazer (evidências)

| Armadilha | Por quê |
|---|---|
| Notificações push/e-mail agressivas | Wordle venceu **sem** notificações ("compromisso limitado"); ansiedade reduz retorno (Stanly) |
| Timers/cronômetro | Ansiedade medida como redutora de retorno (Stanly) |
| Signup wall | Já evitado no Vroom; manter guest-first |
| Tutoriais longos | Simplicidade é parte da fórmula (Wardle/Stanly) |
| PvP tempo real | Squabble exige websockets/salas — custo alto para valor que o duelo assíncrono entrega sem infra |
| Áudio agora | REVVED + RevQuiz dominam; custo de assets/licença alto — só com catálogo já enriquecido |
| Streak SEM archive | O streak pune o ausente; sem archive ele vira motivo de churn (Stanly) |

---

## 8. Diferenciação estratégica (o que o Vroom pode ser que ninguém é)

1. **O daily de carro multilíngue.** Concorrentes verificados são EN-first (Cardle tem só 🇬🇧; REVVED/DailyCarQuiz EN). O Vroom já tem pt-BR/en/es — nenhum concorrente serve o jogador brasileiro no idioma dele.
2. **Vroom Brasil.** Nenhum concorrente tem foco na cultura automotiva local (Uno, Gol, Opala, Chevette, Brasília, Kombi…). Curadoria BR + daily temático cria um mercado que os hubs EN ignoram — e a Wikimedia Commons tem o material.
3. **Duelos assíncronos 1:1.** Gap verde na matriz competitiva: ninguém no nicho tem "desafie seu amigo no mesmo carro do dia". Baixo esforço com a stack atual, viral por natureza.
4. **Ranking justo como identidade.** O anti-cheat server-authoritative já existe e é testado — nenhum clone de agregador (wordly.org etc.) pode dizer o mesmo. Comunicar "aqui você não perde para script" é posicionamento.
5. **Licenças limpas.** Imagens Wikimedia creditadas (autor/licença/sourceUrl no schema) — os clones não creditam. É defesa legal e reputacional.
6. **Escassez bem-sucedida com variedade:** manter o daily único (escassez é a fórmula) e oferecer variedade via modos/séries rotativas em vez de liberar tudo ilimitado — o erro dos clones é virar "treinamento grátis infinito" sem sazonalidade social.

---

## 9. Métricas para acompanhar (ordem de prioridade)

1. **% de primeiras sessões terminando em vitória** (north star do onboarding — Stanly). Alavanca: calibrar dificuldade do carro do dia / ordem de revelação para novatos.
2. **D1 / D7 / D30** de coortes diárias.
3. **Share rate** (compartilhamentos ÷ rounds concluídos) e cliques de retorno por share.
4. **Adesão e sobrevivência de streak** (e uso do archive em dias de volta — anti-churn).
5. **DAU por modo** (qual modo retém quem?) — orienta a ordem da Fase 3.
6. **Distribuição de chutes por vitória** (proxy de dificuldade ideal: média entre 2 e 4 de 5).

---

## 10. Fontes

**Ecossistema e concorrentes**
- [aukspot/dles — 700+ daily games](https://github.com/aukspot/dles) · [listdle.com](https://listdle.com) · [playlin.io](https://playlin.io)
- [DailyCarQuiz.com](https://dailycarquiz.com) — hub com 12 jogos, leaderboard, archive, premium
- [cardle.sh](https://cardle.sh) · [Cardle Classic (specs)](https://cardle.sh/classic) — 300+ carros, streak, archive premium, setas de ano
- [playrevved.com](https://playrevved.com) — Revved (áudio), Cranked (ordenação), Spotted (silhueta), Garage, Ranks, Archive
- [Framed](https://framed.wtf) — modos por tipo de pista, archive, stats, Oscars comunitário, merch

**Retenção e design**
- [The Hard Copy — Wordle's Viral Success is Based on Design](https://thehardcopy.co/wordles-viral-success-is-based-on-design/) (jan/2022)
- [Andy Stanly — Retention lessons from building a daily puzzle](https://dev.to/andystanly/retention-lessons-from-building-a-daily-puzzle-the-streak-is-not-the-feature-2af9)
- [Andy Stanly — Why a daily puzzle needs an archive, not a streak](https://dev.to/andystanly/why-a-daily-puzzle-needs-an-archive-not-a-streak-344i)
- [Duolingo — Improving the Streak (2,4×)](https://blog.duolingo.com/improving-the-streak/) · [Duolingo — How Streaks Keep Learners Committed](https://blog.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals/)
- [Lenny's Newsletter — Behind the Product: Duolingo Streaks](https://www.lennysnewsletter.com/p/behind-the-product-duolingo-streaks)
- [NYT — Connections ganha Stats & Streaks](https://www.nytimes.com/2024/09/03/business/media/connections-wordle-new-york-times-games.html) (set/2024)
- [chess.com — Puzzle Ratings](https://support.chess.com/en/articles/8602396-how-do-puzzle-ratings-work) · [Novo sistema de ratings](https://www.chess.com/news/view/announcing-new-puzzles-rating-system)
- [Polygon — Squabble, o battle royale do Wordle](https://www.polygon.com/22934727/wordle-squabble-against-other-people-battle-royale/) (fev/2022)
- ACM — Persuasive Mobile Game Mechanics For User Retention: DOI [10.1145/3341215.3356261](https://doi.org/10.1145/3341215.3356261)

---

*Relatório gerado em out/2026 como resultado da pesquisa solicitada em m00003. Sem implementação de código — as notas técnicas indicam dependências de schema para o time validar.*
