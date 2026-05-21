-- CreateTable
CREATE TABLE "utenti" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "ruolo" TEXT NOT NULL DEFAULT 'operatore',
    "attivo" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "utente_id" INTEGER,
    "azione" TEXT NOT NULL,
    "entita_id" INTEGER,
    "dettagli" TEXT,
    "creato_il" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_utente_id_fkey" FOREIGN KEY ("utente_id") REFERENCES "utenti" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "codici_sconto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codice" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valore" REAL NOT NULL,
    "attivo" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "impostazioni" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "valore" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ordini" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero_ordine" INTEGER NOT NULL,
    "data_ordine" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nome_cliente" TEXT NOT NULL,
    "telefono_cliente" TEXT,
    "orario_ordine" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orario_consegna" DATETIME NOT NULL,
    "tipo_ritiro" TEXT NOT NULL DEFAULT 'asporto',
    "stato" TEXT NOT NULL DEFAULT 'in_corso',
    "indirizzo_consegna" TEXT,
    "note_citofono" TEXT,
    "note_generali" TEXT,
    "totale_ordine" REAL NOT NULL DEFAULT 0,
    "metodo_pagamento" TEXT,
    "sconto_fisso" REAL NOT NULL DEFAULT 0,
    "sconto_percentuale" REAL NOT NULL DEFAULT 0,
    "importo_ricevuto" REAL,
    "resto" REAL,
    "operatore_id" INTEGER,
    "creato_il" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modificato_il" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ordini_operatore_id_fkey" FOREIGN KEY ("operatore_id") REFERENCES "utenti" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ordini" ("creato_il", "data_ordine", "id", "indirizzo_consegna", "modificato_il", "nome_cliente", "note_citofono", "note_generali", "numero_ordine", "orario_consegna", "orario_ordine", "stato", "telefono_cliente", "tipo_ritiro", "totale_ordine") SELECT "creato_il", "data_ordine", "id", "indirizzo_consegna", "modificato_il", "nome_cliente", "note_citofono", "note_generali", "numero_ordine", "orario_consegna", "orario_ordine", "stato", "telefono_cliente", "tipo_ritiro", "totale_ordine" FROM "ordini";
DROP TABLE "ordini";
ALTER TABLE "new_ordini" RENAME TO "ordini";
CREATE UNIQUE INDEX "ordini_numero_ordine_data_ordine_key" ON "ordini"("numero_ordine", "data_ordine");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "utenti_username_key" ON "utenti"("username");

-- CreateIndex
CREATE UNIQUE INDEX "codici_sconto_codice_key" ON "codici_sconto"("codice");
