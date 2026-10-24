# Vroom — Pesquisa Visual 2026

> **Status: AGUARDANDO APROVAÇÃO** — este documento é o resultado da pesquisa aprofundada de estilos visuais. Nada foi aplicado no código. Escolha uma direção (ou mistura) e eu monto o plano de tokens e executo.
>
> Escopo: 4 vetores paralelos de pesquisa com fontes reais (fetch direto de sites, cases, specs de design) — estilos suaves/premium, estética automotiva autêntica, jogos memoráveis e tendências 2024–2026.

---

## 1. Diagnóstico — por que o atual "Pit Lane 1-bit" cansou

A leitura de que o design está "forte, duro, engessado e seco" bate com o que a indústria registrou:

- **Neo-brutalismo foi pico 2022–23.** A partir de meados de 2024 é descrito como movimento em declínio ("short-lived" — Designmantic, jun/2024; "divergência" — Dialogue Theory, jul/2025; validade de 2–3 anos — Setproduct, jun/2026). O dialeto que envelheceu pior é exatamente o que usamos: **borda 2px sólida + sombra offset chapada**.
- **O que sobreviveu** do brutalismo é a espinha (grid, tipografia bold, contenção) — a pele é que troca.
- **O oposto também é armadilha:** o nicho inteiro de daily car games está congelado no flat Wordle branco (ver §2). Ser "mais um Wordle com foto" é o segundo erro possível.

**O que já é diferencial do Vroom e precisa sobreviver a qualquer redesign:**

1. O **blur progressivo** — mecânica única no nicho (concorrentes usam crop/zoom) e matéria-prima perfeita para estéticas de luz, vidro e revelação.
2. O **dithering Bayer** — é literalmente meio-tom de impresso técnico; evolui de "blocos 1-bit duros" para halftone fino sem virar outra marca.
3. O **laranja `#FF6D00`** — já é, por coincidência, a cor de warning light de painel de carro. Continuidade de marca perfeita com qualquer estética automotiva.
4. **Dark mode** — nenhum concorrente é dark; é território nosso.

---

## 2. O terreno competitivo (fetch direto das 4 home pages)

| Jogo | Visual | Mecânica | DNA automotivo |
|---|---|---|---|
| [CarSpotr](https://www.carspotr.io) | Branco flat, "in the shape of Wordle" (auto-declarado) | Foto central + dropdowns Make/Model/Year, feedback verde/setas, streak 🔥🏆 | Zero |
| [Vroomdle](https://vroomdle.com) | Minimalismo extremo, uma tela | 10 chutes, legenda Correct/Close/Wrong | Zero |
| [Cardle](https://cardle.sh/about) | Flat, tiles verde/laranja/vermelho | 3 modos (Classic/Image/Emoji), linhagem loldle/pokedle assumida | Zero |
| [Carlee](https://playcarlee.com) | Flat e limpo | 6 chutes, grid de atributos com logos de marca, setas ↑↓ | Silhuetas autorais (única personalidade) |

**Síntese:** todos usam fundo claro flat, sans neutra de sistema, tiles do Wordle, zero materialidade (nada evoca papel, metal, pista, garagem) e zero narrativa de desejo — o carro é tratado como **dado**, não como **objeto**.

**O espaço em aberto:** temperatura (quente), textura (matéria), tipografia com caráter (DIN/serif/itálica), e o carro como objeto de desejo. É aí que a próxima seção aponta.

---

## 3. Os 4 vetores de pesquisa

### Vetor 1 — Estilos suaves e premium

**Glassmorphism — 8/10, mas com regras duras.** Bifurcou em 2025: glass clássico vs Liquid Glass da Apple (refração real — na web exige SVG `feTurbulence`/shaders, `backdrop-filter` sozinho não vira Liquid; NN/g: "Liquid Glass Is Cracked"). Tokens de produção: fill branco 10–15%, blur 12–16px + `saturate(150%)`, borda 1px `rgba(255,255,255,0.25)` (a borda é feature de acessibilidade), radius 16, sombra `0 8px 32px rgba(0,0,0,0.25)`. **Uso poupado: só na camada que FLUTUA sobre conteúdo (nav, overlay, input sobre a foto) — nunca superfície de leitura.** Erros clássicos: glass sobre fundo chapado, blur 30px+, texto denso sobre glass. Riscos: GPU em celular de entrada (Axess Lab: custo "desproporcional" em aparelhos baratos), contraste oscilando com a foto que muda todo dia (fill 12% vai de 8:1 a <2:1), halos em glifos pequenos.

**Neumorphism — 2/10, morto.** Texto <4.5:1, botões indistinguíveis, focus fraco. Sobrevivência útil: o padrão **tactile-press** (pinkyui.com/skills/patterns/tactile-press: travel 2–6px, 120–180ms, hit 44px, reduced-motion sem travel) e claymorphism.

**Warm minimalism (Stripe/Airbnb/Linear/Vercel) — 6/10 sozinho.** Lições roubáveis: Stripe usa sombras **cromáticas** (`rgba(50,50,93,0.25) 0 50px 100px -20px`) e orçamento expressivo num único centerpiece; Airbnb DLS — UM vermelho (Rausch `#FF385C`), Ink `#222` nunca `#000`, card de listing **sem borda e sem sombra** ("a foto é a hero, o chrome fica quieto"), UM tier de elevação; Linear — halos radiais com lógica composicional; Vercel Geist — bordas como anéis alpha-white, cor só para status.

**Physicality/skeuomorfismo leve voltou — 5/10.** iOS 26 é "biggest shift since 2013": specular highlights, controles com profundidade sutil, **botão extrudado `0 3px 0 rgba(0,0,0,0.4)` que colapsa no press**.

**Dark com profundidade — 4/10 sozinho, mas é a base de tudo.** Material dark: base `#121212` NUNCA `#000`; elevação por overlays brancos (cards +2%, bars +12%); texto 87%/60%/38%; cores dessaturadas ~20pts. Halation: branco puro sangra para quem tem astigmatismo — usar bone ~92%. Google Photos: "a UI recua para a foto estourar".

> **Veredito do vetor: "Blurred Glass Garage" 9/10** — warm dark minimal (escada `#15141A`/`#1B1A20`, halo flame 8–12% ancorado atrás do card da foto como ÚNICO elemento expressivo) + glass SELETIVO só no chrome flutuante (`rgba(14,14,16,0.65)`, blur 14–16, `saturate(150%)`, borda 1px `rgba(255,255,255,0.12)`, fallback `@supports` sólido) + tactile-press nos chutes + radius 20 no card da foto + hairline 1px `rgba(232,228,216,0.10)` + sombra multicamada `0 24px 48px rgba(0,0,0,0.45)`. Nunca glass em ranking/enunciado. `prefers-reduced-transparency` → sólido.

### Vetor 2 — Estética automotiva autêntica (6 territórios)

**T1. Telemetria/HUD de motorsport — 7.5/10.** Tokens de spec F1 real: grafite em camadas (`#0A0A0C`→`#16171A`→`#1F2024`), branco `#FFF`, setores roxo `#B055F5` (melhor da sessão) / verde `#00D26A` (correto) / amarelo `#FFD100` (atenção), vermelho F1 `#E10600`; tipografia Titillium Web / Chakra Petch / Barlow Condensed com **`font-variant-numeric: tabular-nums` obrigatório** (números sem jitter); timing tower 280–300px, linhas 26–28px, código de 3 letras, barra vertical 3.5px da equipe; radius 0–4px, sem sombra — camadas translúcidas de grafite. Aplicação: contador de 5 chutes = barra de rev de 5 LEDs; ranking = timing tower com **gap para o líder em nº de chutes**; dicas como delta pills. Prós: casa 100% com dark+laranja, dá tratamento "pro" a ranking/stats. Contras: frio, território comum em sim-racing, clássicos não conversam com HUD. Fontes: skills.rest (spec F1 com hexes), mattbirkett.co.uk (F1 TV Graphics), iconic-simracing/iconic-dash (GitHub), figma.com Formula Kit, edriessen.com (timing F1 acessível). *Pit board (1 linha): placas leves de números trocáveis, herança do giz no quadro-negro dos mecânicos (f1technical.net/features/3895).*

**T2. Editorial de revistas de carro clássicas — 9/10.** Tokens: papel cream `#F5EFE3`, tinta `#111111`, vermelho editorial `#A32A22`, cinza quente `#6B6257`, bronze `#8C6B3F`; serif display no masthead (Octane, Classic & Sports Car), **itálico para ênfase editorial**, captions pequenas com crédito, numeração de edição (№, Issue #155); radius 0, sem sombra — margens e composição; grão de filme. Petrolicious: cards fotográficos gigantes + o Petrolicious Post ("jornal impresso… deixe sobre a bancada"). Bring a Trailer: cards de leilão com texto editorial de 4 linhas por carro. RM Sotheby's: escuro cinematográfico + wordmark serifado. Aplicação: foto como capa de matéria ("The Mystery Car — Issue #155"), chute como ficha de colecionador, ranking como índice de leilão, home como capa de revista. Prós: diferenciação máxima (nenhum daily usa serif/cream/heritage), eleva o jogo a curadoria. Contras: **re-skin light completa** (quebra com o dark), risco de parecer site de leilão, exige fotografia sempre bonita.

**T3. Montadoras premium — 7.5/10.** Pagani (DESIGN.md shadcn.io): **3 tokens monocromáticos** — canvas `#000`, surface `#141414`, ink `#FFF`; **"zero brand voltage"** — nenhuma cor entre o visitante e o carro (a cor vem da pintura na foto); Istok Web weight 100, uppercase, display 36px com tracking 3.6px ("the tracking IS the brand"); um único radius na página inteira. "The site IS the press still." Koenigsegg: ink `#040B12` (azul-preto), marrom `#6B5243`/`#44312A`, areia `#9A826C`, hairlines `#AAB3C4`. Porsche: "deep blacks, sleek grays, signature red highlights". Princípio de showroom (colorarchive.org): tornar o carro o objeto mais brilhante e saturado do espaço. Aplicação: foto full-bleed, UI que some — hairlines e labels weight-100 com tracking largo, input de chute como linha hairline, `#FF6D00` como único brand voltage. Prós: maximiza a foto. Contras: pouca gamificação visual, frio, exige fotografia impecável.

**T4. Garage culture / manual de oficina — 9/10, O VENCEDOR deste vetor.** A única estética cuja tarefa nativa (identificar carro por detalhe: grade, farol, roda) **é literalmente a mecânica do jogo**. Tokens: código semafórico do painel — vermelho stop `#D22630`, âmbar caution `#FF8C00` (≈ nosso `#FF6D00`), verde info `#3DBB63` (significado universal, sem legenda); papel técnico cream `#F2EBDC`, kraft `#B89B6C`, safety-orange `#E8641B`, grafite tinta `#111111`. Tipografia **DIN 1451** — a letra do técnico: 1931, Ludwig Goller/Siemens, sinalização alemã, documentação técnica, placas de carro 1956–95; digitais: FF DIN (1995, Albert-Jan Pool), **D-DIN (open source OFL, gratuito)**, Bahnschrift (variável, Windows), Gidole. Nada de seven-segment (dated). Elementos: placas VIN/data plates, tire placards, exploded diagrams com leader lines tracejadas e **hatching 45°** (flavors.design: "hatching on warm paper, one safety-orange spring, part-code leaders"); agulha > número digital (dial Cord 810 de 1936: preto/branco + acento vermelho). *Haynes (1 linha): capas com cutaway técnico de Terry Davey (1972–91), a identidade visual mais reconhecível do manual de oficina.* Radius 2–4px (chanfro de chapa); sombra "stamped" dura curta (`0 1px 0 rgba(0,0,0,.6)` + inset highlight de 1px), zero glow; **halftone de impresso — o nosso Bayer dithering já é isso**; motion: needle sweep de tacômetro, luzes de aviso acendendo. Aplicação: cada chute = linha de checklist carimbado ("MAKE — [ ] / MODEL — [ ] / YEAR — [ ]"); feedback com luzes de painel; 5 chutes = 5 fusíveis/lâmpadas que queimam; foto como **"FIG. 155-A"** em prancha técnica com callouts part-code ("REF 12-3 — HEADLAMP ASSY"); ranking como folha de inspeção; home como bancada (grafite escuro com placas cream flutuando). Contras: execução ruim vira clipart de oficina; semáforo exige disciplina (não virar arco-íris); stencil em excesso = pastiche.

**T5. GT/JDM anos 90–2000 — 7.5/10.** Wangan (Shuto `#0B0C10` + cyan `#26E0E0` / magenta `#E8267A`) ou GT contido (branco-azulado `#DDE8F2`/`#4A90D9`, âmbar de menu GT); itálica condensada de velocidade; kanji como acento; tacômetro analógico gigante (Initial D Arcade Stage: 10 skins de tacômetro); rival cards (Tokyo Xtreme Racer); scanline CRT sutil. Prós: nostalgia máxima para carspotter, juice. Contras: **neon/80s é o território mais saturado da web pós-synthwave** — risco real de clichê.

> **Veredito do vetor: T4 fundido com a camada de dados do T1.** Kit "Workshop Dark": 7 cores — asfalto `#121316`, garagem `#1A1C20`, papel técnico `#F2EBDC`, âmbar warning `#FF6D00`, verde painel `#3DBB63`, vermelho stop `#D93A2B`, aço `#8E97A3`; D-DIN/Bahnschrift (gratuitos) + mono tabular (IBM Plex Mono/Chakra Petch) + itálico condensado só para "speed moments"; radius 3px de chanfro; **hairline 1px `#2A2D33` substitui as bordas duras**; sombra stamped curta; halftone fino + hatching 45°; 3 assinaturas: **placa de spec** (chute/resultado como VIN plate com 4 rebites), **cluster de 5 lâmpadas-fusível** (cada erro queima uma), **FIG. 155-A** (foto em prancha técnica com callouts).

### Vetor 3 — Jogos memoráveis

**Tese central: identidade vem do TRATAMENTO DA FOTO (luz, era, museu) + CHROME COMO INSTRUMENTO — não de restyle de botões.** O neo-brutalismo atual não precisa ser demolido; precisa ganhar luz, calor e voz.

**GeoGuessr — 7/10.** Conteúdo real cru é o protagonista; chrome confessa ser instrumento. A comunidade pediu **rollback** quando a UI engordou (geoguessr.canny.io) — guardrail metodológico: a foto é o estilo.

**Duolingo/Headspace/Finch — 5/10.** Pacote: verde-coruja `#58cc02` em 30%+ da superfície, sombra chunky 4px de pressão física, Feather Bold 800, mascote. Lição: **CUTE ≠ COZY** — streak-pressure e mascote implorando são NEGADORES de coziness; num jogo de carro **o carro é o mascote**. Transfere-se a micro-delícia (motion com propósito, pressão tátil, progressive disclosure), NÃO a paleta nem a culpa. CarSpotr já usa 🔥/🏆 — copiar é correr para a média.

**Cozy adulto (Unpacking / A Little to the Left / PowerWash Sim) — 8/10.** Clareza antes de estilo; gratificação SEM ameaça (PowerWash: "timers deliberadamente ausentes"; a palavra dos jogadores é literalmente "Satisfying"); negador: opulência; foley por material + room tone. **Aplicação-chave: o DESBLUR é o power-washing — revelação POR REGIÕES (cada chute errado "limpa" uma faixa, o jogador VÊ o progresso)**; paleta noturna quente (luz de bancada); zero countdown, zero culpa; ranking como prancha de tempos de track day.

**Escola neal.fun / Universal Paperclips — 7.5/10.** Identidade vem do verbo limpo e premissa levada a sério (neal.fun usa só Roboto); "the interface is the fiction" — a UI É a narrativa; UMA cor cromática no site; desabilitado FAZ FADE, nunca vermelho; títulos-convite ("Uma foto. Cinco chutes. Meia-noite."). Aproveita o 1-bit atual: "brutalismo → instrumento com alma", menor custo.

**Luz/gradiente narrativo (Sky / Journey / Alto's) — 9/10, a mais alta do vetor.** No Sky o gradiente é NARRATIVA (mapeia time-of-day → arco da vida). Para um jogo dark: manter o escuro, mudar a FONTE do estilo — **luz concentrada NA FOTO; glow pertence ao farol/cromo/reflexo, NUNCA a botões**. Duas assinaturas:
- **"Showroom Noturno"** — foto sob spotlight quente + vinheta radial, fundo carvão-quente (nunca preto puro).
- **"Céu da era"** — gradiente sutil mapeado à DÉCADA do carro do dia: 60s mercúrio-azul, 70s âmbar/ouro, 80s azul-magenta, 90s teal/jade, 2000s prata frio, modernos branco-led. **O layout muda com o puzzle, ensina eras sem uma palavra, e NENHUM daily tem.** O Vroom já tem `years` no catálogo — o dado existe.
- Reveal com **flare de farol** ("o carro acende"). Risco: gradiente malfeito = wallpaper de app icon.

**Wordle — 1/10 como direção, 10/10 como disciplina.** Contenção como ativo; 3 cores de feedback honestas; share-grid vira propaganda. Roubo direto: **share card próprio — 5 thumbnails da mesma foto em blur decrescente ("a foto que clareia" = o resultado do jogo vira o logo do jogo)**.

> **Veredito do vetor: "Showroom noturno com alma de brinquedo"** — fundação luz/gradiente narrativo (Sky); emoção cozy adulto (PowerWash); chrome interface-ficção (Paperclips). NÃO fazer: mascote, streak-guilt, 3ª/4ª cor de feedback, gradiente roxo-azul default, glow em botão.

### Vetor 4 — Tendências 2024–2026

- **Brutalismo ↓** (pico 2022–23; fragmentou em anti-design funcional / brutalismo tátil / retro Y2K com validade 2–3 anos). Manter a espinha, trocar a pele.
- **"AI slop" é a tendência-mestra a evitar.** Tells de site feito por IA: Inter/Roboto, roxo/indigo, glass, glow sem fonte, 3 cards idênticos, rounded em tudo, sombras 0.1. Antídotos: fontes com voz (Fraunces, Clash Display, Bricolage), paleta dominante + 1 acento afiado, extremos de peso tipográfico, UM page-load coreografado > microinterações espalhadas. (Referência: prg.sh — "Why Your AI Keeps Building the Same Purple Gradient Website", mea culpa do indigo-500 do Tailwind.)
- **Editorial / quiet luxury ↑** — ausente em dailies: creams, warm blacks (#000 com −20% + tinta vermelha), serif como identidade (Beneath, jan/2025). Awwwards SOTY 2026 = site do **Lando Norris** (F1!). E-commerce = Scout Motors.
- **Motion & texture ↑** — "tactile" é a palavra de 2026; grain via SVG `feTurbulence` (tile 256, opacity 0.03–0.055), **nunca overlay fixo full-viewport sobre conteúdo animado**; Creative Bloq: "imperfection becomes your signature".
- **Cores:** Pantone 2025 = Mocha Mousse `#A47864`; 2026 = Cloud Dancer (off-white); morte do `#000` → warm charcoal `#1c1917`; zero roxo-SaaS.
- **Dailies congelados:** Bandle é flat bem-feito; TimeGuessr diferencia por RESTRIÇÃO ("refreshingly low-stakes", sem leaderboard global). Território livre para **"o daily bonito"**.

> **Veredito do vetor — 3 direções:** (1) **"Capa de Garagem"** editorial — cream `#F2ECE0`, serif Fraunces, Mandarin `#E2751F`, radius 0–4, sem sombra, grain papel 0.035, reveal como revelação de fotografia; (2) **"Asfalto Noturno"** warm dark — charcoal `#1C1917`/`#262120`, âmbar `#F59E0B`→`#E8590C`, condensed bold + mono, radius 12 controles / 0–2 foto, sombras em camadas suaves, grain 0.04, springs (stiffness 180/damping 22) — **recomendada como espinha (menor atrito com o dark atual)**; (3) **"Playroom Tátil"** — off-white `#FAF6EC` + mocha + laranja `#E8462A` + verde-ácido, grotesk 900 + marker, radius 16–24 variado, sombra paper-lift offset 5px na cor da paleta. Hype passageiro (evitar): Y2K/Win98, liquid glass, grain forte, Space Grotesk (já é convergência), editorial "só beige".

---

## 4. Comparativo dos 10 estilos

| # | Estilo | Como ficaria no Vroom | Diferenciação | Migração | Risco principal |
|---|---|---|---|---|---|
| A | **Pit Lane 1-bit** (atual) | baseline | 6/10 | — | "duro, seco, engessado" (confirmado) |
| B | **Asfalto Noturno** | charcoal `#1C1917` (nunca `#000`), âmbar único, sombras em camadas, radius 12, springs | 8/10 | Baixa | Sozinho vira dev-tool genérico |
| C | **Blurred Glass Garage** | glass escuro SÓ no que flutua sobre a foto (input, modal); resto sólido | 9/10 | Média | GPU mobile; contraste vs foto que muda; glass = tell IA se em excesso |
| D | **Capa de Garagem** | cream `#F2ECE0` + serif Fraunces; cada puzzle = capa de revista datada | 9/10 | Alta (re-skin light) | Virar "beige trend"; briga com DNA dark |
| E | **Workshop Dark** | FIG. 155-A, checklist MAKE/MODEL/YEAR, luzes de painel, DIN | 9/10 | Média | Execução ruim = clipart |
| F | **Showroom Noturno** | spotlight na foto + "céu da era" por década + reveal com flare | 9/10 | Média | Gradiente ruim = wallpaper |
| G | **Telemetria F1** | timing tower, rev de 5 LEDs, mono tabular, setores | 7.5/10 | Baixa | Frio; comum em sim-racing |
| H | **Montadora cinematográfica** | foto full-bleed, UI hairline que some, tracking 3.6px | 7.5/10 | Baixa | Pouco juice; parece site, não jogo |
| I | **Wangan/GT 90s** | neon cyan/magenta, tacômetro, rival cards, scanlines | 7.5/10 | Média | Pós-synthwave saturado = clichê |
| J | **Playroom Tátil** | off-white + mocha + paper-lift + marker | 7/10 | Alta | Infantiliza; conflita com gearhead |

**Reprovados com razão:** neumorphism (morto por acessibilidade), glassmorphism como sistema inteiro (só como chrome flutuante), mascote fofo + streak-guilt (o carro é o mascote; copiar CarSpotr é correr para a média).

---

## 5. Veredito consolidado — "Oficina Noturna"

Os 4 vetores descrevem a mesma direção por ângulos diferentes:

> **Asfalto quente à meia-luz onde a foto é a única cor real da tela, o desblur é o prazer do jogo, e o chrome finge ser telemetria.**

### Kit de tokens

**Paleta (9):**

| Papel | Cor | Obs |
|---|---|---|
| Fundo (asfalto) | `#1C1917` | warm charcoal, NUNCA `#000` (consenso 2025, halation) |
| Painel (garagem) | `#262220` | elevação por overlays quentes, não por sombra |
| Superfície alta | `#322B27` | hover/raised |
| Hairline | `rgba(232,228,216,0.10)` | 1px, substitui a borda 2px dura |
| Papel técnico (placas) | `#F2EBDC` | placas de spec, checklist carimbado |
| Primária (âmbar warning) | `#FF6D00` | mantém o laranja — é cor de painel de carro |
| OK (verde painel) | `#3DBB63` | código semafórico |
| Stop (vermelho) | `#D93A2B` | |
| Texto | `#EDE7DA` (87%) / 60% / 38% | escalas Material, bone ~92% contra halation |

**Tipografia:** display condensed bold (títulos, "speed moments") + **D-DIN ou Bahnschrift (gratuitos)** para labels carimbados + mono tabular (`tnum` obrigatório) para números/ranking. Corpo pode migrar de Inter no ritmo das fases (Inter é tell nº1 de AI slop, mas trocar tudo de uma vez aumenta o custo).

**Forma & sombra:** radius 10–12px em controles (fim do 0 radical), 3–4px em placas (chanfro de chapa); sombra "stamped" curta `0 3px 0 rgba(0,0,0,0.4)` que **colapsa no press** (o DNA brutalista sobrevive como tátil); elevação por camadas quentes, não por blur.

**Textura & luz:** grain SVG `feTurbulence` 0.03–0.05 em superfícies grandes (nunca fixo sobre conteúdo animado); dithering Bayer evolui para **halftone fino de impresso** só em texturas pontuais (placas cream); spotlight quente sutil na foto + vinheta radial; **"céu da era"** = gradiente do fundo mapeado à década do carro do dia (60s mercúrio-azul → 70s âmbar/ouro → 80s azul-magenta → 90s teal/jade → 2000s prata frio → moderno branco-led).

**Chrome (telemetria):** contador de 5 chutes como **cluster de luzes de painel** (cada erro queima uma lâmpada âmbar; acerto acende verde); resultado como **placa de spec** (MAKE/MODEL/YEAR carimbados, 4 rebites); ranking como **prancha de tempos** (posição, código, gap em nº de chutes); dicas como delta pills.

**Momento assinatura:** o reveal — revelação de fotografia com **flare de farol** no acerto ("o carro acende"). Bônus: desblur por regiões (cada erro revela uma faixa — o "power-wash" do vetor 3) como evolução futura da mecânica.

**Share card:** 5 thumbnails da mesma foto em blur decrescente — "a foto que clareia".

### O que NÃO entra (ban-list da pesquisa)

Glow em UI (glow pertence ao farol/cromo na foto) · glass em superfície de leitura · roxo/indigo SaaS · neon synthwave · mascote · streak-guilt · 3ª/4ª cor de feedback · gradiente roxo-azul default · seven-segment · grain fixo full-viewport · stencils em excesso.

---

## 6. Alternativas fortes (se quiser quebrar mais)

- **Capa de Garagem (D)** — a mais ousada: o daily que parece revista de carro clássico. Cream + serif + "Issue №" por puzzle. Custo: re-skin light completa, briga com o DNA dark.
- **Blurred Glass Garage (C)** — a mais "2025": vidro escuro flutuando sobre a foto (input e modais), resto sólido quente. Custo: risco GPU mobile e contraste variável; exige fallback `@supports`.

---

## 7. Plano de aplicação (para quando aprovar)

| Fase | Escopo | Conteúdo |
|---|---|---|
| 1 | Tokens | styles.css + tailwind.config: paleta 9 cores, radius, sombras stamped/camadas, hairlines, grain, feTurbulence, `prefers-reduced-transparency` |
| 2 | Primitivos ui/ | button (press tátil, 10–12px), card, tabs, badge (luzes de painel), input, dialog/tooltip/sonner |
| 3 | Shell + jogo | Header, CarStage (spotlight + vinheta + céu-da-era por `years`), GameInfo (cluster de luzes), GuessInput, ScorePanel (placa de spec / prancha de tempos) |
| 4 | Páginas + assinaturas | Home (hero com FIG. 155-A), Leaderboard (prancha de tempos), share card, halftone nas placas |
| 5 | QA | contraste AA+, reduced-motion, `@supports` fallback, grep ban-list, build+testes |

Critérios de aceite: WCAG AA em todos os pares (halation controlado); foco visível; zero glow em UI; grain nunca sobre texto animado; keepers do atual preservados (blur progressivo, laranja, dark, dither→halftone).

---

## 8. Fontes principais (por vetor)

**Vetor 1:** skills.rest (spec F1) · shadcn.io DESIGN.md (Pagani) · stash.style (Koenigsegg/Pagani) · pinkyui.com (tactile-press) · Axess Lab (GPU glass) · NN/g (Liquid Glass) · Material Design (dark theme elevation)

**Vetor 2:** carspotr.io · vroomdle.com · cardle.sh · playcarlee.com (fetch direto) · skills.rest/skill/f1-design-grandff · mattbirkett.co.uk · github.com/iconic-simracing/iconic-dash · figma.com Formula Kit · edriessen.com · petrolicious.com · octane-magazine.com · bringatrailer.com · rmsothebys.com · classicandsportscar.com · pagani.com · koenigsegg.com · colorarchive.org · flavors.design (exploded driver) · Wikipedia (DIN 1451, Haynes Manual, Wangan, Tokyo Xtreme Racer) · printmag.com (dashboard typography) · carslens.com (warning lights) · gran-turismo.fandom.com · gtplanet.net · projectjdm.org · overtake.gg · en.namu.wiki (Initial D)

**Vetor 3:** geoguessr.canny.io (rollback petition) · kotaku.com (PowerWash Sim) · pockettactics.com (Sky) · neal.fun · Universal Paperclips · duolingo.com · headspace.com · finchofwori.com

**Vetor 4:** designmantic.com (brutalism jun/2024) · dialoguetheory.ca (jul/2025) · setproduct.com (jun/2026) · prg.sh (purple gradient mea culpa) · beneathagency.com (quiet tech, jan/2025) · awwwards.com (SOTY 2026 — Lando Norris) · creativebloq.com (imperfection as signature) · paletterx.com (color trends 2025) · pantone.com (Mocha Mousse / Cloud Dancer)

---

## 9. Decisão pendente

Marque a direção (ou mistura) e eu executo:

- [ ] **Oficina Noturna** (recomendada — B base + F foto + E/G chrome + press tátil + halftone)
- [ ] **Capa de Garagem** (editorial light ousado)
- [ ] **Blurred Glass Garage** (dark + vidro flutuante)
- [ ] Outra combinação da tabela §4 — diga quais linhas
