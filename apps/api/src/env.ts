import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(
      1,
      'DATABASE_URL é obrigatória: string de conexão Postgres (Supabase/Neon ou Postgres local — ver apps/api/.env.example)',
    )
    .refine(
      (value) => /^postgres(ql)?:\/\//.test(value),
      'DATABASE_URL precisa ser uma URL Postgres (postgresql://…) — o projeto não usa mais SQLite',
    ),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET precisa ter ao menos 16 caracteres'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  /** Número de hops de proxy confiáveis (ex.: 1 atrás de nginx/Render). '' = desativado. */
  TRUST_PROXY: z.string().default(''),
  /** Client ID OAuth do Google (console.cloud.google.com). '' = login Google desativado. */
  GOOGLE_CLIENT_ID: z.string().default(''),
  /**
   * SameSite do cookie de sessão em produção. Default 'none' mantém o cenário
   * GitHub Pages ↔ API em domínio distinto. 'lax' quando front e API vivem no
   * mesmo site (api.exemplo.com ↔ exemplo.com, ou mesmo domínio via reverse
   * proxy). '' é tratado como 'none'. Dev ignora (sempre lax).
   */
  COOKIE_SAMESITE: z.string().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Variáveis de ambiente inválidas:', parsed.error.flatten().fieldErrors);
  throw new Error('Configuração de ambiente inválida');
}

const isProduction = parsed.data.NODE_ENV === 'production';

/** Segredos conhecidos/publicados que jamais podem assinar tokens em produção. */
const BLOCKED_SECRETS = new Set(['dev-secret-troque-em-producao', 'test-secret-com-16-caracteres']);

if (isProduction) {
  const secret = parsed.data.JWT_SECRET;

  if (secret.length < 32) {
    throw new Error(
      'JWT_SECRET inseguro para produção: use ao menos 32 caracteres (ideal: openssl rand -base64 48).',
    );
  }

  if (BLOCKED_SECRETS.has(secret)) {
    throw new Error(
      'JWT_SECRET é um valor de exemplo conhecido — gere um segredo real (openssl rand -base64 48).',
    );
  }
}

/**
 * Valor para app.set('trust proxy'): false, true ou nº de hops.
 * Cuidado com z.coerce.boolean: transforma a string 'false' em true.
 */
function parseTrustProxy(raw: string): boolean | number {
  const value = raw.trim().toLowerCase();

  if (!value || value === 'false' || value === '0') {
    return false;
  }
  if (value === 'true') {
    // 'true' confia em TODOS os hops — XFF forjável de qualquer proxy no
    // caminho. O deploy real tem UM proxy na frente; quem precisar de
    // mais hops configura um número explícito.
    return 1;
  }

  const hops = Number(value);
  return Number.isInteger(hops) && hops > 0 ? hops : false;
}

/**
 * SameSite efetivo do cookie de sessão em produção: 'none', 'lax' ou 'strict'.
 * Vazio/inválido cai em 'none' (comportamento histórico do GitHub Pages).
 */
function parseCookieSameSite(raw: string): 'none' | 'lax' | 'strict' {
  const value = raw.trim().toLowerCase();

  if (value === 'lax' || value === 'strict') {
    return value;
  }
  return 'none';
}

export const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGIN.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  isProduction,
  isTest: parsed.data.NODE_ENV === 'test',
  trustProxy: parseTrustProxy(parsed.data.TRUST_PROXY),
  cookieSameSite: parseCookieSameSite(parsed.data.COOKIE_SAMESITE),
};
