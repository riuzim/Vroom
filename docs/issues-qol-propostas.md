# Propostas de Issues – Qualidade de Vida Visível ao Público

Baseadas na pesquisa de concorrentes, sem cópia descarada, apenas referência.

## web:feat(daily): arquivo de puzzles diários passados
**O que**: permitir re-jogar dailies anteriores em modo consulta.
**Por quê**: padrão CarSpotr/Carva. Jogadores perdem o interesse quando não podem revisar.
**Critério**: página /archive com lista por data, bloqueio de pontuação, visual igual ao dia original.
**Tamanho**: medium.

## web:feat(practice): modo prática ilimitado
**O que**: modo sem limite diário, carros aleatórios do catálogo, sem pontuação global.
**Por quê**: THROTTLE Unlimited aumenta retenção.
**Critério**: botão “Praticar” na home, não conta para streak, sem anti-cheat restritivo.

## web:feat(hints): sistema de dicas progressivas
**O que**: dica opcional por rodada: região, década, carroceria, curiosidade.
**Por quê**: ajuda novatos, reduz abandono.
**Critério**: gastar 1 tentativa ao usar dica, ou reduzir pontuação. Dicas visíveis após 2 erros.

## web:feat(guess): autocomplete e filtro de make/model
**O que**: input de chute com busca filtrável por nome, fabricante, ano.
**Por quê**: CarSpotr reduz atrito de digitação.
**Critério**: type-to-filter, sugestões top 8, navegação por teclado.

## web:feat(feedback): feedback por atributos do carro
**O que**: após chute errado, mostrar pistas paralelas: região correta?, década perto?, carroceria?
**Por quê**: THROTTLE usa tiles coloridos para acelerar aprendizado.
**Critério**: não revelar identificação, apenas proximidade por atributo.

## web:feat(share): grid de compartilhamento enriquecido
**O que**: melhorar share atual com emoji por tentativa, streak atual, modo jogado.
**Por quê**: viralidade.
**Critério**: texto pre-formatado com número de tentativas, modo, streak.

## web:feat(details): página de detalhes pós-revelação
**O que**: ao acertar/encerrar, abrir modal/página com ficha do carro, ano, curiosidade, créditos da foto.
**Por quê**: valor educacional, referência Wikimedia.
**Critério**: usar dados já em `cars.ts`, sem expor anti-cheat.

## web:feat(streak): perdão de 1 dia por semana
**O que**: streak congela 1x/semana, como CarSpotr.
**Por quê**: reduz frustração.
**Critério**: contador mostra “congelado”, reativa ao jogar.

## web:feat(stats): dashboard de estatísticas públicas
**O que**: tela de estatísticas com distribuição de palpites, média, % vitórias por modo.
**Por quê**: padrão do gênero.
**Critério**: gráficos simples, dados já existentes.

## web:feat(ui): indicador visual de progresso de blur/letras
**O que**: barra mostrando “nitidez 40%” e letras reveladas.
**Por quê**: feedback imediato de progresso.
**Critério**: acessível.

## web:feat(accessibility): atalhos de teclado e foco
**O que**: Enter para chutar, Esc para fechar modais, navegação via tab.
**Por quê**: QoL e acessibilidade.

## web:feat(ux): dark mode toggle persistente
**O que**: toggle visível no header, salva preferência.
**Por quê**: esperado em 2026.

Prioridade sugerida: arquivo de dailies, modo prática, dicas, autocomplete, detalhes pós-revelação.
