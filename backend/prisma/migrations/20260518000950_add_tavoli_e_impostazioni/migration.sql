-- AlterTable
ALTER TABLE "ordini" ADD COLUMN "numero_tavolo" INTEGER;

-- CreateTable
CREATE TABLE "impostazioni" (
    "chiave" TEXT NOT NULL PRIMARY KEY,
    "valore" TEXT NOT NULL
);
