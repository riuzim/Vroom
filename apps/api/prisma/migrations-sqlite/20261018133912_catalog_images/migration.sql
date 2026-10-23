/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Car` table. All the data in the column will be lost.
  - Added the required column `author` to the `Car` table without a default value. This is not possible if the table is not empty.
  - Added the required column `brand` to the `Car` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Car` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filePageUrl` to the `Car` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageData` to the `Car` table without a default value. This is not possible if the table is not empty.
  - Added the required column `license` to the `Car` table without a default value. This is not possible if the table is not empty.
  - Added the required column `model` to the `Car` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceUrl` to the `Car` table without a default value. This is not possible if the table is not empty.
  - Added the required column `years` to the `Car` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Car" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "years" TEXT NOT NULL,
    "imageData" BLOB NOT NULL,
    "imageMime" TEXT NOT NULL DEFAULT 'image/jpeg',
    "sourceUrl" TEXT NOT NULL,
    "filePageUrl" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "license" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Car" ("active", "createdAt", "id", "name") SELECT "active", "createdAt", "id", "name" FROM "Car";
DROP TABLE "Car";
ALTER TABLE "new_Car" RENAME TO "Car";
CREATE UNIQUE INDEX "Car_name_key" ON "Car"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
