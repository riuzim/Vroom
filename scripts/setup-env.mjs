// Passo do `pnpm setup`: garante que apps/api/.env exista.
// Copia o .env.example (commited) na primeira execução — sem esse arquivo
// a API não sobe (dotenv) e o Prisma não acha o DATABASE_URL. Cross-platform,
// sem dependências, seguro para rodar de novo (não sobrescreve nada).
import { copyFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const example = path.join(root, 'apps', 'api', '.env.example');
const env = path.join(root, 'apps', 'api', '.env');

if (existsSync(env)) {
  console.log('• apps/api/.env já existe — mantendo o atual.');
} else if (existsSync(example)) {
  copyFileSync(example, env);
  console.log('• apps/api/.env criado a partir do .env.example (padrões de dev).');
} else {
  console.error('✗ apps/api/.env.example não encontrado — rode `pnpm setup` na raiz do projeto.');
  process.exit(1);
}
