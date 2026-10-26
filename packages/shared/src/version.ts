/**
 * Versionamento do jogo — a partir da v1.1.0 toda mudança que vai para o
 * jogador sobe a versão e ganha uma entrada no VERSION_LOG (o "sinal de
 * versionamento" pedido pelo dono). A página de Feedback renderiza
 * `GAME_VERSION` e este histórico no diálogo "Histórico de versões".
 *
 * REGRA (também no AGENTS.md da raiz): mexeu no jogo para o jogador?
 * 1. suba GAME_VERSION (patch para correção, minor para novidade);
 * 2. adicione a entrada no TOPO do VERSION_LOG, com data YYYY-MM-DD;
 * 3. frases curtas em pt-BR, uma por mudança, na voz "o jogo agora …".
 */

/** Versão atual do jogo, exibida como "v{GAME_VERSION}" na UI. */
export const GAME_VERSION = '1.1.0';

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
    version: '1.1.0',
    date: '2026-10-26',
    changes: [
      'Carros não se repetem: os modos livres sorteiam fora do histórico recente da sua run.',
      'Sino de feedback novo: o admin vê quantos feedbacks não lidos chegaram na aba de feedbacks.',
      'Sinal de versionamento: a versão do jogo agora aparece com o histórico de mudanças.',
    ],
  },
];
