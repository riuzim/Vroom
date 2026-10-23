/*
  Warnings:

  - You are about to drop the column `mistakes` on the `Round` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Round" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "carId" INTEGER NOT NULL,
    "mode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'playing',
    "attemptsUsed" INTEGER NOT NULL DEFAULT 0,
    "revealedLetters" TEXT NOT NULL DEFAULT '[]',
    "dailyDate" TEXT,
    "points" INTEGER,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    CONSTRAINT "Round_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Round_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Round" ("attemptsUsed", "carId", "dailyDate", "endedAt", "id", "mode", "points", "revealedLetters", "startedAt", "status", "userId") SELECT "attemptsUsed", "carId", "dailyDate", "endedAt", "id", "mode", "points", "revealedLetters", "startedAt", "status", "userId" FROM "Round";
DROP TABLE "Round";
ALTER TABLE "new_Round" RENAME TO "Round";
CREATE INDEX "Round_userId_status_idx" ON "Round"("userId", "status");
CREATE INDEX "Round_status_idx" ON "Round"("status");
CREATE INDEX "Round_mode_idx" ON "Round"("mode");
CREATE UNIQUE INDEX "Round_userId_dailyDate_key" ON "Round"("userId", "dailyDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
