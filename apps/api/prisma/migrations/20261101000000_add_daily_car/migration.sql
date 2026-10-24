-- Carro oficial de cada desafio do dia (por modo) — archive-ready:
-- escrito uma vez por dia/modo no primeiro início de rodada.

-- CreateTable
CREATE TABLE "DailyCar" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "carId" INTEGER NOT NULL,

    CONSTRAINT "DailyCar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyCar_date_mode_key" ON "DailyCar"("date", "mode");

-- AddForeignKey
ALTER TABLE "DailyCar" ADD CONSTRAINT "DailyCar_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
