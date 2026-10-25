import { beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { prisma } from '../lib/prisma.js';

// Mock do google-auth-library: payloads determinísticos por credential.
// A rota real valida assinatura, audience e issuer contra o Google —
// aqui só verificamos o fluxo da nossa API com tickets válidos/inválidos.
vi.mock('google-auth-library', () => {
  const payloads: Record<string, Record<string, unknown>> = {
    'token-newuser': { sub: 'g-new-1', email: 'gnew@vroom.test', email_verified: true },
    'token-link': { sub: 'g-link-1', email: 'linkme@vroom.test', email_verified: true },
    'token-unverified': { sub: 'g-unv-1', email: 'unv@vroom.test', email_verified: false },
    'token-unset': { sub: 'g-unset-1', email: 'unset@vroom.test' },
    'token-incomplete': { sub: 'g-inc-1' },
  };

  class OAuth2Client {
    async verifyIdToken({ idToken }: { idToken: string }) {
      const payload = payloads[idToken];
      if (!payload) {
        throw new Error('token inválido');
      }
      return { getPayload: () => payload };
    }
  }

  return { OAuth2Client };
});

const app = createApp();

let unique = 0;
function newUser() {
  unique += 1;
  return {
    username: `pilot${unique}`,
    email: `pilot${unique}@vroom.test`,
    password: 'password123',
  };
}

async function dbCarOf(roundId: number) {
  const round = await prisma.round.findUnique({ where: { id: roundId }, include: { car: true } });
  return round?.car ?? null;
}

describe('GET /api/health', () => {
  it('responde ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Autenticação', () => {
  it('registra, loga, consulta /me e faz logout', async () => {
    const agent = request.agent(app);
    const user = newUser();

    const reg = await agent.post('/api/auth/register').send(user);
    expect(reg.status).toBe(201);
    expect(reg.body.user.username).toBe(user.username);
    expect(reg.headers['set-cookie']).toBeDefined();

    const dup = await agent.post('/api/auth/register').send(user);
    expect(dup.status).toBe(409);

    const me = await agent.get('/api/auth/me');
    expect(me.body.user?.username).toBe(user.username);

    await agent.post('/api/auth/logout');
    const meAfter = await agent.get('/api/auth/me');
    expect(meAfter.body.user).toBeNull();
  });

  it('rejeita senha errada', async () => {
    const agent = request.agent(app);
    const user = newUser();
    await agent.post('/api/auth/register').send(user);
    await agent.post('/api/auth/logout');

    const bad = await agent.post('/api/auth/login').send({ email: user.email, password: 'errada' });
    expect(bad.status).toBe(401);
  });

  it('rejeita payload inválido', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'x', email: 'nope', password: '1' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Dados inválidos');
  });

  it('não diferencia email de username no 409 (anti-enumeração)', async () => {
    const user = newUser();
    await request(app).post('/api/auth/register').send(user);

    const sameEmail = await request(app)
      .post('/api/auth/register')
      .send({ username: 'outronome', email: user.email, password: 'password123' });
    expect(sameEmail.status).toBe(409);
    expect(sameEmail.body.error).toBe('Nome de usuário ou email já registrado');

    const sameUsername = await request(app)
      .post('/api/auth/register')
      .send({ username: user.username, email: 'diferente@vroom.test', password: 'password123' });
    expect(sameUsername.status).toBe(409);
    expect(sameUsername.body.error).toBe('Nome de usuário ou email já registrado');
  });

  it('rejeita senha acima de 72 bytes (limite do bcrypt)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'bytes72',
        email: 'bytes72@vroom.test',
        // 73 caracteres ASCII = 73 bytes > 72 — não pode passar.
        password: 'a'.repeat(73),
      });
    expect(res.status).toBe(400);
  });
});

describe('Login com Google', () => {
  it('cria conta a partir do credential e reentra com o mesmo ticket', async () => {
    const agent = request.agent(app);

    const first = await agent.post('/api/auth/google').send({ credential: 'token-newuser' });
    expect(first.status).toBe(200);
    expect(first.body.user.email).toBe('gnew@vroom.test');
    expect(first.body.user.username).toBe('gnew');

    const me = await agent.get('/api/auth/me');
    expect(me.body.user?.email).toBe('gnew@vroom.test');

    const again = await agent.post('/api/auth/google').send({ credential: 'token-newuser' });
    expect(again.status).toBe(200);
    expect(again.body.user.id).toBe(first.body.user.id);

    // Conta só-Google não tem senha: login por senha sempre falha.
    const byPassword = await request(app)
      .post('/api/auth/login')
      .send({ email: 'gnew@vroom.test', password: 'qualquer' });
    expect(byPassword.status).toBe(401);
  });

  it('vincula uma conta local existente pelo email verificado', async () => {
    const agent = request.agent(app);
    const reg = await agent
      .post('/api/auth/register')
      .send({ username: 'linkme', email: 'linkme@vroom.test', password: 'password123' });
    expect(reg.status).toBe(201);

    const google = await agent.post('/api/auth/google').send({ credential: 'token-link' });
    expect(google.status).toBe(200);
    expect(google.body.user.id).toBe(reg.body.user.id);
    expect(google.body.user.username).toBe('linkme');

    const linked = await prisma.user.findUnique({ where: { googleId: 'g-link-1' } });
    expect(linked?.id).toBe(reg.body.user.id);
  });

  it('rejeita credential inválido, email não verificado e payload incompleto', async () => {
    const bad = await request(app).post('/api/auth/google').send({ credential: 'token-invalido' });
    expect(bad.status).toBe(401);
    expect(bad.body.error).toBe('Não foi possível validar seu login do Google.');

    const unverified = await request(app)
      .post('/api/auth/google')
      .send({ credential: 'token-unverified' });
    expect(unverified.status).toBe(401);

    const incomplete = await request(app)
      .post('/api/auth/google')
      .send({ credential: 'token-incomplete' });
    expect(incomplete.status).toBe(401);

    const unset = await request(app).post('/api/auth/google').send({ credential: 'token-unset' });
    expect(unset.status).toBe(401);
    expect(unset.body.error).toBe('Seu email do Google não foi verificado.');

    const empty = await request(app).post('/api/auth/google').send({ credential: '' });
    expect(empty.status).toBe(400);
  });
});

describe('Rodadas server-authoritative', () => {
  it('nunca expõe o nome do carro antes do fim da rodada', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send(newUser());

    const start = await agent.post('/api/rounds').send({ mode: 'classic' });
    expect(start.status).toBe(201);
    expect(start.body.round.carName).toBeUndefined();

    const car = await dbCarOf(start.body.round.id);
    expect(car).not.toBeNull();
    expect(JSON.stringify(start.body)).not.toContain(car!.name);

    // A imagem viaja como caminho da própria API indexado pela RODADA (nunca
    // pelo carro: o id do carro antes do fim seria um oráculo do nome).
    // Créditos completos (modelo/autor/licença) só depois do fim da rodada.
    expect(start.body.round.imagePath).toBe(`/api/rounds/${start.body.round.id}/image`);
    expect(start.body.round.carCredits).toBeUndefined();
  });

  it('serve a imagem do carro direto do banco, com cache e ETag', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send(newUser());
    const start = await agent.post('/api/rounds').send({ mode: 'classic' });
    const car = await dbCarOf(start.body.round.id);

    const image = await request(app).get(`/api/cars/${car!.id}/image`);
    expect(image.status).toBe(200);
    expect(image.headers['content-type']).toBe('image/png');
    expect(image.headers['cache-control']).toContain('immutable');
    expect(image.headers.etag).toBeTruthy();
    expect(image.body.length).toBeGreaterThan(60);

    const revalidation = await request(app)
      .get(`/api/cars/${car!.id}/image`)
      .set('If-None-Match', image.headers.etag);
    expect(revalidation.status).toBe(304);

    expect((await request(app).get('/api/cars/99999/image')).status).toBe(404);
    expect((await request(app).get('/api/cars/abc/image')).status).toBe(404);
  });

  it('valida chute errado, revela dica e reduz o blur', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send(newUser());
    const start = await agent.post('/api/rounds').send({ mode: 'classic' });

    const wrong = await agent
      .post(`/api/rounds/${start.body.round.id}/guess`)
      .send({ guess: 'carro que nao existe' });

    expect(wrong.status).toBe(200);
    expect(wrong.body.result).toBe('wrong');
    expect(wrong.body.attemptsLeft).toBe(4);
    expect(wrong.body.revealedLetter).toBeTruthy();
    expect(wrong.body.round.blur).toBe(11);
  });

  it('pontua no acerto e registra no ranking', async () => {
    const agent = request.agent(app);
    const user = newUser();
    await agent.post('/api/auth/register').send(user);

    const start = await agent.post('/api/rounds').send({ mode: 'classic' });
    const car = await dbCarOf(start.body.round.id);
    await agent.post(`/api/rounds/${start.body.round.id}/guess`).send({ guess: 'chute errado' });

    const correct = await agent
      .post(`/api/rounds/${start.body.round.id}/guess`)
      .send({ guess: car!.name });
    expect(correct.body.result).toBe('correct');
    expect(correct.body.points).toBe(40);
    expect(correct.body.round.carName).toBe(car!.name);
    expect(correct.body.round.carCredits?.author).toBe('Vroom QA');
    expect(correct.body.round.carCredits?.license).toBe('CC0');

    const board = await request(app).get('/api/leaderboard');
    const entry = board.body.entries.find(
      (item: { username: string }) => item.username === user.username,
    );
    expect(entry?.points).toBe(40);

    const stats = await agent.get('/api/profile/stats');
    expect(stats.body.stats.totalPoints).toBe(40);
  });

  it('encerra após 5 erros e bloquea novos chutes', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send(newUser());
    const start = await agent.post('/api/rounds').send({ mode: 'classic' });

    let last;
    for (let index = 0; index < 5; index += 1) {
      last = await agent
        .post(`/api/rounds/${start.body.round.id}/guess`)
        .send({ guess: `errado ${index}` });
    }
    expect(last!.body.result).toBe('failed');
    expect(last!.body.round.carName).toBeTruthy();

    const extra = await agent
      .post(`/api/rounds/${start.body.round.id}/guess`)
      .send({ guess: 'qualquer' });
    expect(extra.status).toBe(403);
  });

  it('permite pular revelando a resposta sem pontos', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send(newUser());
    const start = await agent.post('/api/rounds').send({ mode: 'classic' });

    const skip = await agent.post(`/api/rounds/${start.body.round.id}/skip`);
    expect(skip.status).toBe(200);
    expect(skip.body.result).toBe('skipped');
    expect(skip.body.round.carName).toBeTruthy();

    const rounds = await agent.post('/api/rounds').send({ mode: 'classic' });
    expect(rounds.body.round.id).not.toBe(start.body.round.id);
  });

  it('retoma a rodada em andamento do usuário', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send(newUser());
    const first = await agent.post('/api/rounds').send({ mode: 'hard' });
    await agent.post(`/api/rounds/${first.body.round.id}/guess`).send({ guess: 'erro' });

    const again = await agent.post('/api/rounds').send({ mode: 'hard' });
    expect(again.body.round.id).toBe(first.body.round.id);
    expect(again.body.round.attemptsLeft).toBe(4);
  });

  it('daily permite apenas uma rodada por dia', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send(newUser());
    const first = await agent.post('/api/rounds').send({ mode: 'daily' });

    for (let index = 0; index < 5; index += 1) {
      await agent.post(`/api/rounds/${first.body.round.id}/guess`).send({ guess: `erro ${index}` });
    }

    const second = await agent.post('/api/rounds').send({ mode: 'daily' });
    expect(second.body.round.id).toBe(first.body.round.id);
    expect(second.body.round.status).toBe('failed');
  });

  it('visitante joga mas não pontua no ranking', async () => {
    const guest = request.agent(app);
    const start = await guest.post('/api/rounds').send({ mode: 'classic' });
    expect(start.status).toBe(201);

    const car = await dbCarOf(start.body.round.id);
    const correct = await guest
      .post(`/api/rounds/${start.body.round.id}/guess`)
      .send({ guess: car!.name });
    expect(correct.body.result).toBe('correct');

    // Nenhum score pode existir para rodadas de visitante.
    const guestScores = await prisma.score.findMany({ where: { round: { userId: null } } });
    expect(guestScores).toEqual([]);
  });

  it('modo inválido é rejeitado', async () => {
    const res = await request(app).post('/api/rounds').send({ mode: 'turbo' });
    expect(res.status).toBe(400);
  });
});

describe('Concorrência e guards de estado', () => {
  it('acertos paralelos pontuam UMA vez só (guard + unique roundId)', async () => {
    const agent = request.agent(app);
    const user = newUser();
    await agent.post('/api/auth/register').send(user);

    const start = await agent.post('/api/rounds').send({ mode: 'classic' });
    const car = await dbCarOf(start.body.round.id);
    const roundId = start.body.round.id;

    const responses = await Promise.all(
      Array.from({ length: 5 }, () =>
        agent.post(`/api/rounds/${roundId}/guess`).send({ guess: car!.name }),
      ),
    );

    const ok = responses.filter((r) => r.status === 200);
    // Quem perde a corrida recebe 409 (guard do claim) OU 403 (leu o estado
    // já commitado pelo vencedor — possível agora que o Postgres é paralelo
    // de verdade; no SQLite serializado só existia o 409). Ambos provam o
    // mesmo invariante: só UM acerto pontuou.
    const lost = responses.filter((r) => r.status === 409 || r.status === 403);
    expect(ok.length).toBe(1);
    expect(lost.length).toBe(4);
    expect(ok[0].body.result).toBe('correct');

    // Exatamente UM score para a rodada — índice único trava a duplicação.
    const scores = await prisma.score.findMany({ where: { roundId } });
    expect(scores.length).toBe(1);
    expect(scores[0].points).toBe(50);

    // Tentativa manual de duplicar o score bate no @@unique([roundId]).
    await expect(
      prisma.score.create({
        data: { userId: scores[0].userId, roundId, points: 999, mode: 'classic' },
      }),
    ).rejects.toMatchObject({ code: 'P2002' });

    const board = await request(app).get('/api/leaderboard');
    const entry = board.body.entries.find(
      (item: { username: string }) => item.username === user.username,
    );
    expect(entry?.points).toBe(50);
  });

  it('chutes errados paralelos consumem UMA tentativa só', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send(newUser());
    const start = await agent.post('/api/rounds').send({ mode: 'classic' });
    const roundId = start.body.round.id;

    const responses = await Promise.all(
      Array.from({ length: 3 }, (_unused, i) =>
        agent.post(`/api/rounds/${roundId}/guess`).send({ guess: `paralelo ${i}` }),
      ),
    );

    const ok = responses.filter((r) => r.status === 200);
    // Caso típico (snapshot compartilhado): 1×200 + 2×409 = UMA tentativa.
    // Sob paralelismo real do Postgres um request tardio pode reler o
    // estado já atualizado e consumir a PRÓXIMA tentativa — o contrato
    // firme é: cada 200 consome exatamente UMA tentativa; 409/403, nenhuma.
    const lost = responses.filter((r) => r.status === 409 || r.status === 403);
    expect(ok.length + lost.length).toBe(3);
    expect(ok.length).toBeGreaterThanOrEqual(1);

    const round = await prisma.round.findUnique({ where: { id: roundId } });
    expect(round?.attemptsUsed).toBe(ok.length);
  });

  it('skips paralelos encerram a rodada UMA vez', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send(newUser());
    const start = await agent.post('/api/rounds').send({ mode: 'classic' });
    const roundId = start.body.round.id;

    const responses = await Promise.all([
      agent.post(`/api/rounds/${roundId}/skip`),
      agent.post(`/api/rounds/${roundId}/skip`),
    ]);

    expect(responses.filter((r) => r.status === 200).length).toBe(1);
    // Perdedor: 409 (claim) ou 403 (leu estado já encerrado) — idem acertos.
    expect(responses.filter((r) => r.status === 409 || r.status === 403).length).toBe(1);
  });

  it('daily paralela cria UMA rodada e ambas recebem a mesma', async () => {
    const agent = request.agent(app);
    const user = newUser();
    const reg = await agent.post('/api/auth/register').send(user);

    const [a, b] = await Promise.all([
      agent.post('/api/rounds').send({ mode: 'daily' }),
      agent.post('/api/rounds').send({ mode: 'daily' }),
    ]);

    // O vencedor da corrida cria (201); o perdedor cai no P2002,
    // re-busca a rodada existente e devolve 200 com o MESMO id.
    expect([a.status, b.status].sort()).toEqual([200, 201]);
    expect(a.body.round.id).toBe(b.body.round.id);

    const today = new Date().toISOString().slice(0, 10);
    const rounds = await prisma.round.findMany({
      where: { userId: reg.body.user.id, mode: 'daily', dailyDate: today },
    });
    expect(rounds.length).toBe(1);
  });
});

describe('Hardening de entrada e headers', () => {
  it('id de rodada inválido vira 404 limpo (não 500)', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send(newUser());

    for (const bad of ['abc', '0', '12.5', '-3']) {
      const guess = await agent.post(`/api/rounds/${bad}/guess`).send({ guess: 'x' });
      expect(guess.status).toBe(404);

      const skip = await agent.post(`/api/rounds/${bad}/skip`);
      expect(skip.status).toBe(404);
    }
  });

  it('JSON malformado vira 400 (não 500)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send('{email: sem-fechamento');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Requisição inválida: JSON malformado.');
  });

  it('responde com headers de segurança básicos', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});

describe('Ranking', () => {
  beforeAll(async () => {
    // Garante pelo menos um usuário pontuado para as queries agregadas.
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send(newUser());
    const start = await agent.post('/api/rounds').send({ mode: 'classic' });
    const car = await dbCarOf(start.body.round.id);
    await agent.post(`/api/rounds/${start.body.round.id}/guess`).send({ guess: car!.name });
  });

  it('agrega por período e por modo', async () => {
    const all = await request(app).get('/api/leaderboard?period=all&mode=all');
    expect(all.status).toBe(200);
    expect(all.body.entries.length).toBeGreaterThan(0);
    expect(all.body.entries[0].points).toBeGreaterThan(0);

    const today = await request(app).get('/api/leaderboard?period=today&mode=daily');
    expect(today.status).toBe(200);
    expect(today.body.entries).toEqual([]);
  });
});

describe('Fase 1: modos novos e desafio do dia registrado', () => {
  it('modo silhouette joga como modo livre e mantém o anti-cheat', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send(newUser());

    const start = await agent.post('/api/rounds').send({ mode: 'silhouette' });
    expect(start.status).toBe(201);
    expect(start.body.round.carName).toBeUndefined();
    expect(start.body.round.status).toBe('playing');

    const car = await dbCarOf(start.body.round.id);
    const correct = await agent
      .post(`/api/rounds/${start.body.round.id}/guess`)
      .send({ guess: car!.name });
    expect(correct.body.result).toBe('correct');
    expect(correct.body.points).toBe(50);
  });

  it('modo themed é diário: mesma série, uma rodada por dia, tema no payload', async () => {
    const agent = request.agent(app);
    const reg = await agent.post('/api/auth/register').send(newUser());

    const start = await agent.post('/api/rounds').send({ mode: 'themed' });
    expect(start.status).toBe(201);
    expect(start.body.round.theme).toBeTruthy();
    expect(start.body.round.dailyDate).toContain('#');

    // Segundo início no mesmo dia retoma a MESMA rodada.
    const again = await agent.post('/api/rounds').send({ mode: 'themed' });
    expect(again.body.round.id).toBe(start.body.round.id);

    const today = new Date().toISOString().slice(0, 10);
    const rounds = await prisma.round.findMany({
      where: { userId: reg.body.user.id, mode: 'themed' },
    });
    expect(rounds.length).toBe(1);
    expect(rounds[0].dailyDate).toBe(`${today}#${start.body.round.theme}`);
  });

  it('usuários diferentes recebem o MESMO carro do daily (via DailyCar)', async () => {
    const agentA = request.agent(app);
    await agentA.post('/api/auth/register').send(newUser());
    const agentB = request.agent(app);
    await agentB.post('/api/auth/register').send(newUser());

    const startA = await agentA.post('/api/rounds').send({ mode: 'daily' });
    const startB = await agentB.post('/api/rounds').send({ mode: 'daily' });

    const today = new Date().toISOString().slice(0, 10);
    const registered = await prisma.dailyCar.findUnique({
      where: { date_mode: { date: today, mode: 'daily' } },
    });
    expect(registered).not.toBeNull();

    const carA = await dbCarOf(startA.body.round.id);
    const carB = await dbCarOf(startB.body.round.id);
    expect(registered!.carId).toBe(carA!.id);
    expect(carB!.id).toBe(carA!.id);
  });

  it('themed também registra em DailyCar com o slot datado#tema', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send(newUser());

    const start = await agent.post('/api/rounds').send({ mode: 'themed' });
    expect(start.status).toBe(201);

    const today = new Date().toISOString().slice(0, 10);
    const theme = start.body.round.theme;
    const registered = await prisma.dailyCar.findUnique({
      where: { date_mode: { date: `${today}#${theme}`, mode: 'themed' } },
    });
    expect(registered).not.toBeNull();

    const car = await dbCarOf(start.body.round.id);
    expect(registered!.carId).toBe(car!.id);
  });

  it('stats traz streak, vitórias e distribuição de chutes do daily', async () => {
    const agent = request.agent(app);
    const reg = await agent.post('/api/auth/register').send(newUser());

    const start = await agent.post('/api/rounds').send({ mode: 'daily' });
    const car = await dbCarOf(start.body.round.id);
    await agent.post(`/api/rounds/${start.body.round.id}/guess`).send({ guess: 'erro' });
    const correct = await agent
      .post(`/api/rounds/${start.body.round.id}/guess`)
      .send({ guess: car!.name });
    expect(correct.body.result).toBe('correct');

    const stats = await agent.get('/api/profile/stats');
    const daily = stats.body.stats.daily;
    expect(daily.played).toBe(1);
    expect(daily.wins).toBe(1);
    // Acertou no 2º chute → distribution[1] = 1.
    expect(daily.distribution).toEqual([0, 1, 0, 0, 0, 0]);
    expect(daily.streak.current).toBe(1);
    expect(daily.streak.best).toBe(1);

    // Rodada de daily "ontem" inserida direto no banco (simula quem jogou
    // ontem): o streak atual cresce para 2 e o recorde acompanha.
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    await prisma.round.create({
      data: {
        userId: reg.body.user.id,
        carId: car!.id,
        mode: 'daily',
        status: 'correct',
        attemptsUsed: 3,
        points: 20,
        dailyDate: yesterday,
        endedAt: new Date(),
      },
    });

    const statsAfter = await agent.get('/api/profile/stats');
    const dailyAfter = statsAfter.body.stats.daily;
    expect(dailyAfter.played).toBe(2);
    expect(dailyAfter.streak.current).toBe(2);
    expect(dailyAfter.streak.best).toBe(2);
    // A rodada de ontem (3 erros + acerto) entra na distribuição no 4º chute.
    expect(dailyAfter.distribution).toEqual([0, 1, 0, 1, 0, 0]);
  });
});

describe('Feedback', () => {
  const PNG_BASE64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

  it('visitante envia feedback com print', async () => {
    const res = await request(app)
      .post('/api/feedback')
      .send({
        category: 'BUG',
        title: 'Foto não revela',
        content: 'Depois do quinto erro a imagem continuou borrada.',
        image: { data: PNG_BASE64, mime: 'image/png' },
      });
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.id).toBeGreaterThan(0);
  });

  it('rejeita categoria fora do enum', async () => {
    const res = await request(app).post('/api/feedback').send({
      category: 'ELOGIO',
      title: 'Título válido',
      content: 'Conteúdo válido do feedback.',
    });
    expect(res.status).toBe(400);
  });

  it('sem sessão não lista feedbacks', async () => {
    const res = await request(app).get('/api/feedback');
    expect(res.status).toBe(401);
  });

  it('não-admin não lista feedbacks', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send(newUser());

    const res = await agent.get('/api/feedback');
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FEEDBACK_ADMIN_ONLY');
  });

  it('admin lista, vê o print e apaga ao marcar como lido', async () => {
    // Os testes anteriores deste describe também criam feedback: o painel
    // precisa começar vazio para os asserts de comprimento fazerem sentido.
    await prisma.feedback.deleteMany();

    const agent = request.agent(app);
    const reg = await agent
      .post('/api/auth/register')
      .send({ username: 'riuzimjp', email: 'riuzimjp@vroom.test', password: 'password123' });
    // A conta riuzimjp administra o painel por username.
    expect(reg.body.user.isAdmin).toBe(true);

    // Um bug com print (visitante) e uma opinião (o próprio admin).
    await request(app)
      .post('/api/feedback')
      .send({
        category: 'BUG',
        title: 'Bug com print',
        content: 'Reproduz o bug assim e assim.',
        image: { data: PNG_BASE64, mime: 'image/png' },
      });
    await agent.post('/api/feedback').send({
      category: 'OPINION',
      title: 'Ótimo jogo',
      content: 'Estou gostando muito do visual novo.',
    });

    const list = await agent.get('/api/feedback');
    expect(list.status).toBe(200);
    expect(list.body.feedbacks).toHaveLength(2);

    const [newest, oldest] = list.body.feedbacks;
    expect(newest.title).toBe('Ótimo jogo');
    expect(newest.author).toBe('riuzimjp');
    expect(newest.hasImage).toBe(false);
    expect(oldest.title).toBe('Bug com print');
    expect(oldest.author).toBeNull();
    expect(oldest.hasImage).toBe(true);

    const image = await agent.get(`/api/feedback/${oldest.id}/image`);
    expect(image.status).toBe(200);
    expect(image.headers['content-type']).toContain('image/png');

    const markRead = await agent.delete(`/api/feedback/${oldest.id}`);
    expect(markRead.status).toBe(200);

    const listAfter = await agent.get('/api/feedback');
    expect(listAfter.body.feedbacks).toHaveLength(1);

    const again = await agent.delete(`/api/feedback/${oldest.id}`);
    expect(again.status).toBe(404);
  });

  it('conta com email de admin vira admin mesmo com outro username', async () => {
    // Caso real: login Google com riuzimjp@gmail.com pode derivar username
    // diferente — admin tem que reconhecer pelo email também.
    const agent = request.agent(app);
    const reg = await agent
      .post('/api/auth/register')
      .send({ username: 'zelador', email: 'riuzimjp@gmail.com', password: 'password123' });
    expect(reg.body.user.isAdmin).toBe(true);

    const me = await agent.get('/api/auth/me');
    expect(me.body.user?.isAdmin).toBe(true);

    const list = await agent.get('/api/feedback');
    expect(list.status).toBe(200);
  });
});
