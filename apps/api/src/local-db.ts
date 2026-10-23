// Postgres EMBUTIDO de dev — implementação única usada por:
//   • src/index.ts (ensureLocalDatabase): o `pnpm dev` sobe o banco sozinho;
//   • scripts/local-pg.ts (db:local): servidor dedicado num terminal à parte;
//   • scripts/setup-db.ts (db:local-setup): bootstrap do `pnpm setup`.
// Só age em development com DATABASE_URL apontando pro banco local (:5433).
// Em produção (Supabase/Neon) e nos testes (cluster próprio da suíte) é no-op.
//
// O import de embedded-postgres é DINÂMICO: é devDependency — o build de
// produção não pode quebrar se ela não estiver instalada.
import { existsSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';

export const LOCAL_PG_PORT = 5433;
export const LOCAL_PG_PASSWORD = 'vroom';
export const LOCAL_PG_DB_NAME = 'vroom_dev';
export const LOCAL_PG_DATA_DIR = path.resolve(import.meta.dirname, '..', '.pg-data');
export const LOCAL_DATABASE_URL = `postgresql://postgres:${LOCAL_PG_PASSWORD}@localhost:${LOCAL_PG_PORT}/${LOCAL_PG_DB_NAME}`;

/** Probe TCP barato: alguém já escutando nesta porta? */
export function isPortOpen(port: number, host = 'localhost'): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host });
    const finish = (open: boolean) => {
      socket.destroy();
      resolve(open);
    };
    socket.setTimeout(300, () => finish(false));
    socket.once('connect', () => finish(true));
    socket.once('error', () => finish(false));
  });
}

type EmbeddedPostgres = import('embedded-postgres').default;

/**
 * Sobe o Postgres embutido se ninguém estiver escutando na porta local.
 * Retorna a instância (pra quem precisa stop() depois) ou null quando já
 * havia um servidor no ar — nesse caso ele é REAPROVEITADO, nunca derrubado.
 */
export async function startLocalPg(): Promise<EmbeddedPostgres | null> {
  if (await isPortOpen(LOCAL_PG_PORT)) {
    console.log(`🐘 Postgres local já está no ar: ${LOCAL_DATABASE_URL}`);
    return null;
  }

  const { default: EmbeddedPostgres } = await import('embedded-postgres');
  const pg = new EmbeddedPostgres({
    databaseDir: LOCAL_PG_DATA_DIR,
    user: 'postgres',
    password: LOCAL_PG_PASSWORD,
    port: LOCAL_PG_PORT,
    // Dados persistem em .pg-data entre execuções; stop() NÃO apaga nada.
    persistent: true,
    // initdb UTF8 + locale C: com o locale PT-BR do Windows o initdb criaria
    // um cluster WIN1252, incapaz de guardar os caracteres japoneses do
    // catálogo de carros (erro 22P05 "no equivalent in encoding WIN1252").
    // Só é usado quando o cluster nasce; start() ignora essas flags.
    initdbFlags: ['-E', 'UTF8', '--locale=C'],
    onLog: () => {},
    onError: (message) => console.error(`[pg] ${message}`),
  });

  // initdb apenas na primeira execução (cluster já criado = só start()).
  if (!existsSync(path.join(LOCAL_PG_DATA_DIR, 'PG_VERSION'))) {
    await pg.initialise();
  }
  await pg.start();
  await pg.createDatabase(LOCAL_PG_DB_NAME).catch((error: unknown) => {
    // Banco já existe de um run anterior — segue o baile.
    if (!/already exists/i.test(String(error))) {
      throw error;
    }
  });

  console.log(`🐘 Postgres local no ar: ${LOCAL_DATABASE_URL}`);
  return pg;
}

/**
 * Usado pelo src/index.ts em dev: garante que o banco local da URL de dev
 * esteja no ar antes de a API abrir a porta — assim o `pnpm dev` vira um
 * comando único, sem terminal separado pro banco. No-op em produção/teste
 * ou quando o DATABASE_URL aponta pra outro lugar (ex.: Supabase).
 */
export async function ensureLocalDatabase(databaseUrl: string, nodeEnv: string): Promise<void> {
  if (nodeEnv !== 'development') {
    return;
  }

  let target: URL;
  try {
    target = new URL(databaseUrl);
  } catch {
    return; // URL inválida: deixa o Prisma reclamar depois, com mensagem melhor.
  }

  // Só administramos o banco local padrão; Supabase/Neon nunca passam daqui.
  if (target.hostname !== 'localhost' || target.port !== String(LOCAL_PG_PORT)) {
    return;
  }

  const pg = await startLocalPg();
  if (pg) {
    console.log('    (o banco encerra junto com este processo; os dados ficam em apps/api/.pg-data)');
  }
}
