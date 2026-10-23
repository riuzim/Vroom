# Migrations SQLite (arquivo histórico)

Estas migrations criaram o banco quando o Vroom usava SQLite. Elas foram
arquivadas aqui em 2026-10-22, quando o provider mudou para
`postgresql` (Supabase em produção, Postgres embutido em dev/testes).

Elas **não são aplicáveis** ao Postgres (dialeto diferente) e o Prisma ignora
esta pasta — as migrations ativas vivem em `../migrations/`, iniciando pela
`20261022220000_postgres_init` (gerada com `prisma migrate diff --from-empty`).

Mantida por valor histórico/arqueológico; o estado do schema é idêntico em
ambos os dialetos.
