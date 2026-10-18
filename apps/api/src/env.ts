import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().default('file:./dev.db'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET precisa ter ao menos 16 caracteres'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  /** Número de hops de proxy confiáveis (ex.: 1 atrás de nginx/Render). '' = desativado. */
  TRUST_PROXY: z.string().default(''),
  /** Client ID OAuth do Google (console.cloud.google.com). '' = login Google desativado. */
  GOOGLE_CLIENT_ID: z.string().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Variáveis de ambiente inválidas:', parsed.error.flatten().fieldErrors);
  throw new Error('Configuração de ambiente inválida');
}

const isProduction = parsed.data.NODE_ENV === 'production';

/** Segredos conhecidos/publicados que jamais podem assinar tokens em produção. */
const BLOCKED_SECRETS = new Set([
  'dev-secret-troque-em-producao',
  'test-secret-com-16-caracteres',
]);

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
    return true;
  }

  const hops = Number(value);
  return Number.isInteger(hops) && hops > 0 ? hops : false;
}

export const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGIN.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  isProduction,
  isTest: parsed.data.NODE_ENV === 'test',
  trustProxy: parseTrustProxy(parsed.data.TRUST_PROXY),
};
