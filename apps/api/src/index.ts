import 'dotenv/config';
import { createApp } from './app.js';
import { ensureLocalDatabase } from './local-db.js';
import { env } from './env.js';

// Dev com banco local: sobe o Postgres embutido antes de abrir a porta —
// assim `pnpm dev` é um comando único. No-op em produção/teste.
await ensureLocalDatabase(env.DATABASE_URL, env.NODE_ENV);

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`Vroom API escutando na porta ${env.PORT} (${env.NODE_ENV})`);
});
