// Configuração compartilhada do Postgres de teste (embutido, descartável).
// global-setup.ts sobe o servidor; setup.ts apenas replica a URL em cada
// worker do vitest antes de o app importar o Prisma.

export const TEST_PG_PORT = 54329;
export const TEST_PG_PASSWORD = 'vroom-test';
export const TEST_DB_NAME = 'vroom_test';

export const TEST_DATABASE_URL = `postgresql://postgres:${TEST_PG_PASSWORD}@localhost:${TEST_PG_PORT}/${TEST_DB_NAME}`;
