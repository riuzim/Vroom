-- Sessão de visitante: liga rodadas guest ao browser que as criou.
-- Sem isso, qualquer script encerra rodadas alheias por id sequencial
-- (griefing) — inclusive queimando o desafio diário da vítima.
ALTER TABLE "Round" ADD COLUMN "guestSessionId" TEXT;
