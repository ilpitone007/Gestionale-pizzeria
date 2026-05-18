-- CreateTable
CREATE TABLE "categorie_pizza" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "ordine" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "pizze" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descrizione" TEXT,
    "categoria_id" INTEGER NOT NULL,
    "prezzo_base" REAL NOT NULL,
    "disponibile" BOOLEAN NOT NULL DEFAULT true,
    "immagine_url" TEXT,
    "creato_il" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modificato_il" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pizze_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorie_pizza" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ingredienti" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "pizza_ingredienti" (
    "pizza_id" INTEGER NOT NULL,
    "ingrediente_id" INTEGER NOT NULL,

    PRIMARY KEY ("pizza_id", "ingrediente_id"),
    CONSTRAINT "pizza_ingredienti_pizza_id_fkey" FOREIGN KEY ("pizza_id") REFERENCES "pizze" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "pizza_ingredienti_ingrediente_id_fkey" FOREIGN KEY ("ingrediente_id") REFERENCES "ingredienti" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "categorie_aggiunta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "aggiunte" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "prezzo" REAL NOT NULL DEFAULT 0,
    "categoria_id" INTEGER,
    "disponibile" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "aggiunte_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorie_aggiunta" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ordini" (
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
    "modificato_il" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "voci_ordine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ordine_id" INTEGER NOT NULL,
    "pizza_id" INTEGER,
    "nome_pizza_snapshot" TEXT NOT NULL,
    "prezzo_base_snapshot" REAL NOT NULL,
    "note" TEXT,
    "prezzo_totale_voce" REAL NOT NULL,
    "posizione" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "voci_ordine_ordine_id_fkey" FOREIGN KEY ("ordine_id") REFERENCES "ordini" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "voci_ordine_pizza_id_fkey" FOREIGN KEY ("pizza_id") REFERENCES "pizze" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "voce_aggiunte_selezionate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "voce_ordine_id" INTEGER NOT NULL,
    "aggiunta_id" INTEGER,
    "nome_aggiunta_snapshot" TEXT NOT NULL,
    "prezzo_aggiunta_snapshot" REAL NOT NULL,
    CONSTRAINT "voce_aggiunte_selezionate_voce_ordine_id_fkey" FOREIGN KEY ("voce_ordine_id") REFERENCES "voci_ordine" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "voce_aggiunte_selezionate_aggiunta_id_fkey" FOREIGN KEY ("aggiunta_id") REFERENCES "aggiunte" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "categorie_pizza_nome_key" ON "categorie_pizza"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "pizze_nome_key" ON "pizze"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "ingredienti_nome_key" ON "ingredienti"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "categorie_aggiunta_nome_key" ON "categorie_aggiunta"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "aggiunte_nome_key" ON "aggiunte"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "ordini_numero_ordine_data_ordine_key" ON "ordini"("numero_ordine", "data_ordine");
