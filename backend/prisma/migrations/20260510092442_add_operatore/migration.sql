-- CreateTable
CREATE TABLE "operatori" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "cognome" TEXT NOT NULL,
    "pin" TEXT,
    "ruolo" TEXT NOT NULL DEFAULT 'operatore',
    "attivo" BOOLEAN NOT NULL DEFAULT true,
    "creato_il" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modificato_il" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    "note_generali" TEXT,
    "totale_ordine" REAL NOT NULL DEFAULT 0,
    "creato_il" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modificato_il" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "operatore_id" INTEGER,
    CONSTRAINT "ordini_operatore_id_fkey" FOREIGN KEY ("operatore_id") REFERENCES "operatori" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ordini" ("creato_il", "data_ordine", "id", "modificato_il", "nome_cliente", "note_generali", "numero_ordine", "orario_consegna", "orario_ordine", "stato", "telefono_cliente", "tipo_ritiro", "totale_ordine") SELECT "creato_il", "data_ordine", "id", "modificato_il", "nome_cliente", "note_generali", "numero_ordine", "orario_consegna", "orario_ordine", "stato", "telefono_cliente", "tipo_ritiro", "totale_ordine" FROM "ordini";
DROP TABLE "ordini";
ALTER TABLE "new_ordini" RENAME TO "ordini";
CREATE UNIQUE INDEX "ordini_numero_ordine_data_ordine_key" ON "ordini"("numero_ordine", "data_ordine");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
