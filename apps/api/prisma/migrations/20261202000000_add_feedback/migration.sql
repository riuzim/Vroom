-- Feedback dos jogadores: opinião / bug (com print opcional) / sugestão.
-- "Marcar como lido" no painel admin = DELETE; sem estado intermediário.
CREATE TABLE "Feedback" (
    "id" SERIAL NOT NULL,
    "authorId" INTEGER,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageData" BYTEA,
    "imageMime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- Autor é nulo para visitantes; conta apagada não arrasta o feedback.
ALTER TABLE "Feedback"
    ADD CONSTRAINT "Feedback_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Painel filtra por categoria, sempre em ordem de chegada.
CREATE INDEX "Feedback_category_createdAt_idx" ON "Feedback"("category", "createdAt");
