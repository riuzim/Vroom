import 'dotenv/config';
import { createApp } from './app.js';
import { env } from './env.js';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`Vroom API escutando na porta ${env.PORT} (${env.NODE_ENV})`);
});
