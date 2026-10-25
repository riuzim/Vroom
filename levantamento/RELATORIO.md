# Relatório — Levantamento dos 100 carros do Vroom

**Objetivo**: catálogo de 100 carros com imagens verificadas, onde a foto bate
com os dados do carro (marca, modelo e **geração correta**), pronto para o
banco de dados do jogo.

**Resultado**: 100/100 verificados, 0 `not_found`, 0 substituições de reserva.
41 carros re-verificados (tinham imagem imgur sem proveniência) + 59 novos.

## Fonte e método

Todas as imagens vêm do **Wikimedia Commons** — licenças livres, URLs estáveis
e, principalmente, **verificação documental**: cada arquivo tem página própria
com título, descrição, categorias, autor e licença. Nada foi escolhido "no
olho"; cada seleção passou pelo protocolo:

1. **Descoberta** via API (`action=query&list=categorymembers|search` nas
   categorias do modelo/geração).
2. **Metadados** via `prop=imageinfo&iiprop=url|size|mime|extmetadata` —
   `ObjectName`, `ImageDescription`, `Categories`, `Artist`, `LicenseShortName`.
3. **Correspondência documental**: filename + descrição + categorias devem
   identificar o modelo EXATO e a geração/trim escolhidos (ex.: "BMW M3" só
   vale com "Category:BMW M3 (E30)" — geração errada rejeita).
4. **Rejeições automáticas**: interior, motor, emblema/lot, brinquedo,
   réplica, carro de corrida com patrocínio, foto em grupo/mais de um carro
   no quadro.
5. **Qualidade técnica**: original ≥800px de largura (menor do lote:
   1565px), thumb de 1280px no `upload.wikimedia.org`, sem query params, mime
   JPEG/PNG.
6. **Registro por carro** em `levantamento/batches/batch-N/<slug>.json` com
   evidência (`matchEvidence`), alternativas verificadas (`notes`) e
   proveniência completa.

## Estatísticas

| Métrica    | Valor                                                                                                                   |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| Carros     | 100 (41 re-verificados + 59 novos)                                                                                      |
| Marcas     | 38                                                                                                                      |
| Categorias | supercar 20 · sport 16 · jdm 16 · suv 11 · sedan 10 · classic 10 · muscle 5 · hatch 3 · ev 3 · pickup 2 · bra 2 · lux 2 |
| Licenças   | CC BY-SA 4.0 (71) · CC BY 2.0 (10) · CC0 (6) · CC BY-SA 3.0 (5) · Public domain (4) · CC BY 4.0 (3) · CC BY-SA 2.0 (1)  |
| Formato    | 100 JPEG, largura mínima 1565px                                                                                         |

## Decisões de era/trim (por lote)

**Batch 1 — 20 existentes** (motoristas do dia a dia): BMW XM (G09), AMG GT R
(C190), 911 (992.1 Carrera 4 GTS), 911 GT3 RS (992.1), Civic (11ª ger. 2022),
BRZ (ZD8), Impreza (WRX GC8 1998 — era rally), Skyline GT-R (BNR34), GT-R
(R35 facelift), Mustang (S550 GT), Camaro (6ª ger. SS), 3 Series (G20), Camry
(XV70), E-Class (W213), A4 (B9 facelift), Golf (Mk8 GTI), Altima (L34),
Sonata (DN8), Optima (K5 DL3 — nome atual do Optima), RX-7 (FD3S).

**Batch 2 — 21 existentes**: Model S (2018 100D), F-Type (X152), Wrangler
(JL), XC90 (2ª ger.), Aventador SVJ, 720S, Senna (street), P1 (street), Sprinter
Trueno (AE86 1985), Supra (A80), Eclipse (2G), Lancer (comum 2007-09, NÃO
Evolution), R8 (Type 42), Uno (italiano 1987), E36 (325i), Chiron (padrão),
488 Spider (conversível), Carrera GT, LFA (2012), RS6 (C5), F40 (street).

**Batch 3 — 22 novos** (supercarros + americanos): Huracán (LP610-4), Countach
(25th Anniversario), Diablo (SV), Enzo, LaFerrari (coupé), Testarossa (geração
original), 918 Spyder, Veyron (16.4), Zonda (C12), Agera (base), Challenger
(SRT Hellcat), Charger (clássico R/T 1968), Viper (SRT10), Firebird (Trans Am
1979), Ford GT (2ª ger.), F-150 (13ª ger. FX4), Bronco (6ª ger. 2021+),
Corvette (C8 Stingray), Bel Air (1957 Sport Coupe), Model 3 (pré-Highland),
Escalade (5ª ger. — ver ressalvas), DeLorean DMC-12 (1983).

**Batch 4 — 19 novos** (JDM + brasileiros): RX-8 (SE3P), MX-5 (NA 1990), NSX
(NA1), S2000 (AP1), Prelude (5ª ger.), Integra (DC2 Type R), Celica (T230),
MR2 (W20 1990), Corolla (E210 sedan), 370Z (Z34), Silvia (S15), 240Z (S30
1972), 3000GT/GTO (Z16A), Opala (coupé facelift), Toro (2024 Volcano), Lancer
Evolution (Evo X), Land Cruiser (J200), Pajero (2ª ger. — forma "Dakar" do
Brasil), Hilux (AN120).

**Batch 5 — 18 novos** (europeus): M3 (E30), M5 (E39), i8 (Coupé I12), TT (8N),
Taycan (4S), Cayenne (3ª ger.), 300SL (Gullwing W198), G-Wagon (G63 W463),
DB5 (1964), E-Type (Series I), Defender (110 L316), Range Rover (L405), Mini
(Rover 2000, street), Fiat 500 (clássico 1970), Phantom (VII), Continental GT
(2ª ger. V8), Beetle (Tipo 1), P1800 (1971-72).

## Ressalvas documentadas

- **Escalade**: todos os 8 candidatos no Commons são a versão **ESV**
  (entre-eixos longo) — aceito como trim da mesma família, nota no JSON.
- **Hilux**: a categoria real é "Toyota **HiLux**" (com L maiúsculo);
  "Category:Toyota Hilux" vem vazia.
- **Altima**: o arquivo `2019 Nissan Altima SR AWD.jpg` foi evitado porque as
  URLs internas trazem a grafia "Altmla" (inconsistência de renomeação).
- **Armadilhas evitadas** (registradas em `notes`): "2022 Ford Bronco" era
  Bronco **Sport**; "1957 Bel Air" era **Two-Ten**; DeLorean 1981 com dois
  carros no quadro; Charger 1969 sem artista/420px; Escalade IQ (EV distinto);
  Senna/P1/F40/LFA de versão de pista; Mini Cooper S de rali em vez de street.
- **Lancer**: escolhido o Lancer comum CJ/CY (2007-09) — o Evolution é outro
  carro do catálogo (batch 4).

## Como o levantamento virou banco

1. `pnpm catalog` valida os 100 JSONs e gera `packages/shared/src/cars.ts`,
   `packages/shared/src/names.ts` e `levantamento/catalogo-vroom.json`.
2. `pnpm catalog:images` baixa as imagens para `apps/api/prisma/car-images/`
   (cache **commitado no repositório** — a seed funciona offline).
3. `pnpm --filter @vroom/api db:seed` grava os bytes como **BLOB** no SQLite
   (`imageData`) junto com a atribuição (`author`, `license`, `filePageUrl`).
4. Em runtime a imagem sai do banco via `GET /api/cars/:id/image` —
   **zero dependência de imgur/Wikimedia**; a atribuição aparece ao fim da
   rodada.

## Verificação final (2026-10-18)

- **Testes**: 48/48 verdes — regras de jogo (15), integração da API (27, incluindo
  o endpoint de imagem com ETag/304/404), smoke do web (6).
- **Lint/typecheck/build**: ESLint 0 erros; `tsc` da API limpo; build de
  produção do web limpo.
- **Anti-cheat no bundle**: nenhuma URL de catálogo nos assets do browser
  (apenas `carNames`, para as sugestões de chute).
- **QA vivo** (API real + banco real): 20/20 — imagem servida do BLOB com
  `Cache-Control: immutable` e revalidação 304; payload durante o jogo sem
  `name`/`carName`; acerto revela nome + créditos de licença; 100 carros
  ativos, todos com BLOB >10KB, licença e autor.
- **Incidentes resolvidos**: HTTP 429 do Commons durante o download em massa
  (resolvido com backoff educado + 2ª passada); scratch de subagente removido
  (`.cache/` do batch-3); global-setup migrou para `--force-reset`.

## Manutenção (adicionar/trocar um carro)

1. Crie `levantamento/batches/batch-N/<slug>.json` seguindo o schema dos
   existentes (toda a evidência é obrigatória).
2. `pnpm catalog && pnpm catalog:images && pnpm --filter @vroom/api db:seed`.
3. `scripts/build-catalog.mjs` valida tudo (100 exatos, URLs do Commons,
   licença/autor, sem duplicados) e falha o build se algo estiver errado.
