-- Login com Google + guarda dupla anti-race no Score.
--
-- 1) User.passwordHash vira nullable (contas Google não têm senha local)
--    e nasce a coluna User.googleId ("sub" do Google, única por usuário).
-- 2) Score ganha índice único em roundId: no máximo UM registro de pontos
--    por rodada, mesmo se dois acertos simultâneos passarem pela guarda da
--    transação. Antes de criar o índice, deduplica Scores legados criados
--    pela race de acertos paralelos (mantém o mais antigo de cada rodada).

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "googleId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("createdAt", "email", "id", "passwordHash", "username") SELECT "createdAt", "email", "id", "passwordHash", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- Dedup de Scores legados (SQLite trata NULLs como distintos no índice único,
-- então scores avulsos sem roundId continuam permitidos).
DELETE FROM "Score"
WHERE "roundId" IS NOT NULL
  AND "id" NOT IN (
    SELECT MIN("id") FROM "Score" WHERE "roundId" IS NOT NULL GROUP BY "roundId"
  );

-- CreateIndex
CREATE UNIQUE INDEX "Score_roundId_key" ON "Score"("roundId");
