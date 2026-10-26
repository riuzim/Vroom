-- Sino de feedback novo para o admin: feedbacks criados depois de
-- User.feedbackSeenAt (última visita à caixa de entrada) aparecem como
-- "não vistos" no sino até a próxima visita.
ALTER TABLE "User" ADD COLUMN "feedbackSeenAt" TIMESTAMP(3);

-- Sorteio sem repetição ("carros se repetiram na minha run") varre as
-- rodadas recentes por sessão de visitante: índice para a consulta.
CREATE INDEX "Round_guestSessionId_idx" ON "Round"("guestSessionId");
