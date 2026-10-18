// Ambiente das rotas de teste — roda antes de qualquer import do app.
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET = 'test-secret-com-16-caracteres';
process.env.NODE_ENV = 'test';
process.env.PORT = '4999';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
