/**
 * Feedback dos jogadores — opinião, bug (com print opcional) ou sugestão.
 *
 * A regra de admin é derivada do username, sem coluna no banco: se amanhã
 * precisar de mais admins, o lugar natural é um env/var ou role no banco.
 * O contrato (o que a API aceita e devolve) mora aqui, em um lugar só.
 */

/** Categorias exibidas no formulário e nos filtros do painel admin. */
export const FEEDBACK_CATEGORIES = ['OPINION', 'BUG', 'IMPROVEMENT'] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const FEEDBACK_TITLE_MAX = 120;
export const FEEDBACK_CONTENT_MAX = 4000;

/** Print de bug: PNG/JPEG/WebP, no máximo 2 MB (base64 no corpo do JSON). */
export const FEEDBACK_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const FEEDBACK_IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;

/**
 * Conta de administração do painel de feedback. O usuário pediu: a conta
 * `riuzimjp`, se existir, administra — e a conta dele entra pelo Google com
 * o email `riuzimjp@gmail.com`, que pode gerar username derivado diferente
 * (ex.: `riuzimjp42` se o puro já estava ocupado). Admin, portanto, é
 * username OU email; ambos case-insensitive.
 */
export const ADMIN_USERNAME = 'riuzimjp';
export const ADMIN_EMAIL = 'riuzimjp@gmail.com';

export function isAdminUsername(username: string | null | undefined): boolean {
  return typeof username === 'string' && username.trim().toLowerCase() === ADMIN_USERNAME;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  return typeof email === 'string' && email.trim().toLowerCase() === ADMIN_EMAIL;
}

/** Admin por username OU por email (a conta Google do dono). */
export function isAdminAccount(account: {
  username?: string | null;
  email?: string | null;
}): boolean {
  return isAdminUsername(account?.username) || isAdminEmail(account?.email);
}

/** Item de feedback como o painel admin recebe (imagem só via GET separado). */
export interface FeedbackDTO {
  id: number;
  category: FeedbackCategory;
  title: string;
  content: string;
  /** true quando existe print anexado (servido em /api/feedback/:id/image). */
  hasImage: boolean;
  /** Username do autor ou null para feedback de visitante. */
  author: string | null;
  /** ISO 8601. */
  createdAt: string;
}
