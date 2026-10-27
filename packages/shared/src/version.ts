/**
 * Versionamento do jogo — a partir da v1.1.0 toda mudança que vai para o
 * jogador sobe a versão e ganha uma entrada no VERSION_LOG (o "sinal de
 * versionamento" pedido pelo dono). O Header renderiza `GAME_VERSION`
 * e este histórico no diálogo "Histórico de versões".
 *
 * REGRA (também no AGENTS.md da raiz): mexeu no jogo para o jogador?
 * 1. suba GAME_VERSION (patch para correção, minor para novidade);
 * 2. adicione a entrada no TOPO do VERSION_LOG, com data YYYY-MM-DD;
 * 3. frases curtas em pt-BR, uma por mudança, na voz "o jogo agora …".
 */

/** Versão atual do jogo, exibida como "v{GAME_VERSION}" na UI. */
export const GAME_VERSION = '1.2.0';

/** Uma versão lançada com suas mudanças — o changelog do jogo. */
export interface VersionLogEntry {
  /** "1.1.0" — sem o "v": o prefixo é da UI. */
  version: string;
  /** Data de lançamento, YYYY-MM-DD. */
  date: string;
  /** Mudanças da versão, uma frase por linha. */
  changes: string[];
}

/** Histórico de versões, mais recente primeiro. */
export const VERSION_LOG: VersionLogEntry[] = [
  {
    version: '1.2.0',
    date: '2026-10-26',
    changes: [
      // Backfill da Fase 1 (issue #54) — novidades que ficaram sem entrada:
      'Modo diário com sequência (streak): um carro por dia e fogo na constância.',
      'A cada erro o carro ganha silhueta — a dica agora é visual.',
      'Séries temáticas: rodadas em mini-campeonatos por marca ou era.',
      'Compartilhe o resultado em grade estilo Wordle na aba de share.',
      'Site em três idiomas: português, inglês e espanhol.',
      'Aba de feedback: mande print, título e mensagem direto pro jogo.',
      'Fontes próprias: o jogo carrega Barlow direto do site, sem depender do Google Fonts.',
      // Fase 2 (v1.2.0) — LGPD e transparência:
      'Política de privacidade e de cookies reescritas: agora dizem exatamente o que o jogo guarda (cookie de visitante, feedbacks e prints) e por quanto tempo.',
      'Aviso de dados no formulário de feedback: o que é enviado e quando é apagado, com link pra política.',
      'Login do admin verificado por Google: mais uma camada de segurança nas ferramentas do jogo.',
    ],
  },
  {
    version: '1.1.0',
    date: '2026-10-26',
    changes: [
      'Carros não se repetem: os modos livres sorteiam fora do histórico recente da sua run.',
      'Sino de feedback novo: o admin vê quantos feedbacks não lidos chegaram na aba de feedbacks.',
      'Sinal de versionamento: selo da versão no topo do site abre o histórico de mudanças.',
    ],
  },
];
