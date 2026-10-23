// Sobe um Postgres EMBUTIDO para desenvolvimento local (binários do zonky
// via embedded-postgres) — dispensa Docker e Supabase pra rodar a API no PC.
//
// Uso:  pnpm --filter @vroom/api db:local   (deixa rodando; Ctrl+C encerra)
// Na prática o `pnpm dev` já sobe o banco sozinho — este comando é para quem
// prefere o servidor de banco isolado num terminal próprio.
// Os dados sobrevivem entre execuções em apps/api/.pg-data (gitignored).
import { startLocalPg } from '../src/local-db.js';

const pg = await startLocalPg();

if (!pg) {
  // Já havia um servidor no ar (outro db:local / um dev antigo) — nada a gerenciar.
  process.exit(0);
}

let stopping = false;

async function shutdown() {
  if (stopping) return;
  stopping = true;
  console.log('\nEncerrando Postgres local...');
  try {
    await pg.stop();
  } finally {
    process.exit(0);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Mantém o processo vivo enquanto o postgres roda como filho dele.
setInterval(() => {}, 1 << 30);
