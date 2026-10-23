// Ambiente das rotas de teste — roda antes de qualquer import do app.
// A URL é a do Postgres embutido que o global-setup sobe (ver test-db.ts).
import { TEST_DATABASE_URL } from './test-db.js';

process.env.DATABASE_URL = TEST_DATABASE_URL;
process.env.JWT_SECRET = 'test-secret-com-16-caracteres';
process.env.NODE_ENV = 'test';
process.env.PORT = '4999';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
