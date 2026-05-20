-- AlterTable
ALTER TABLE "ordini" ADD COLUMN "indirizzo_consegna" TEXT;
ALTER TABLE "ordini" ADD COLUMN "note_citofono" TEXT;

-- AlterTable
ALTER TABLE "voci_ordine" ADD COLUMN "impasto_id" INTEGER;
ALTER TABLE "voci_ordine" ADD COLUMN "nome_impasto_snapshot" TEXT;
ALTER TABLE "voci_ordine" ADD COLUMN "prezzo_impasto_snapshot" REAL;

-- CreateTable
CREATE TABLE "impasti" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "sovrapprezzo" REAL NOT NULL DEFAULT 0,
    "disponibile" BOOLEAN NOT NULL DEFAULT true
);

-- CreateIndex
CREATE UNIQUE INDEX "impasti_nome_key" ON "impasti"("nome");
