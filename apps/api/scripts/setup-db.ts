// Bootstrap one-shot do banco de DEV local: sobe o Postgres embutido (se não
// houver um no ar), aplica as migrations e semeia o catálogo de carros —
// depois desliga o servidor que ele mesmo subiu. É o passo final do
// `pnpm setup` na raiz: com Postgres, migrations exigem um servidor de pé.
//
// Se o `db:local` já estiver rodando em outro terminal, ele é reaproveitado
// e permanece no ar no final.
import { execSync } from 'node:child_process';
import { LOCAL_DATABASE_URL, startLocalPg } from '../src/local-db.js';

async function main() {
  // null = já há um servidor no ar (db:local); ele fica de pé no final.
  const pg = await startLocalPg();

  try {
    // O Prisma CLI dá prioridade ao ambiente sobre o .env: garantimos o
    // alvo correto independente do DATABASE_URL que estiver no apps/api/.env.
    process.env.DATABASE_URL = LOCAL_DATABASE_URL;

    console.log('• Aplicando migrations (prisma migrate deploy)...');
    execSync('pnpm exec prisma migrate deploy', { stdio: 'inherit', env: process.env });

    console.log('• Semeando o catálogo de carros (prisma/seed.ts)...');
    execSync('pnpm exec tsx prisma/seed.ts', { stdio: 'inherit', env: process.env });

    console.log(`✓ Banco local de dev pronto: ${LOCAL_DATABASE_URL}`);
    console.log(
      pg
        ? '  Pra jogar/desenvolver: pnpm dev (a API sobe o banco sozinha quando precisa).'
        : '  (reaproveitou o servidor do db:local — ele segue no ar)',
    );
  } finally {
    if (pg) {
      await pg.stop().catch(() => undefined);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
