import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { prisma } from '../lib/prisma.js';

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
    const res = await request(app).post('/api/auth/register').send({ username: 'x', email: 'nope', password: '1' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Dados inválidos');
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

    const correct = await agent.post(`/api/rounds/${start.body.round.id}/guess`).send({ guess: car!.name });
    expect(correct.body.result).toBe('correct');
    expect(correct.body.points).toBe(40);
    expect(correct.body.round.carName).toBe(car!.name);

    const board = await request(app).get('/api/leaderboard');
    const entry = board.body.entries.find((item: { username: string }) => item.username === user.username);
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
      last = await agent.post(`/api/rounds/${start.body.round.id}/guess`).send({ guess: `errado ${index}` });
    }
    expect(last!.body.result).toBe('failed');
    expect(last!.body.round.carName).toBeTruthy();

    const extra = await agent.post(`/api/rounds/${start.body.round.id}/guess`).send({ guess: 'qualquer' });
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
    const correct = await guest.post(`/api/rounds/${start.body.round.id}/guess`).send({ guess: car!.name });
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
