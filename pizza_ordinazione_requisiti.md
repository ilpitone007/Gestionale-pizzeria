# 🍕 PizzaOrder — Requisiti e Procedure
### Sistema di Ordinazione per Pizzeria d'Asporto

---

## 1. Panoramica del Progetto

**PizzaOrder** è un'applicazione web per la gestione delle ordinazioni di una **pizzeria d'asporto**. Permette all'operatore di cassa di inserire ordini in modo rapido, registrare il nome e il contatto del cliente, specificare l'**orario di consegna/ritiro concordato**, gestire il menu con prezzi aggiornabili in tempo reale e inviare la comanda in stampa per la cucina o per il cliente al ritiro.

---

## 2. Stack Tecnologico Consigliato

| Layer | Tecnologia |
|---|---|
| Frontend | React + Tailwind CSS (oppure HTML/CSS/JS vanilla) |
| Stato applicativo | React Context API o Zustand |
| Backend API | Node.js + Express |
| ORM | Prisma (consigliato) oppure Knex.js |
| Database principale | PostgreSQL (produzione) / SQLite (sviluppo locale) |
| Driver SQL | `pg` per PostgreSQL, `better-sqlite3` per SQLite |
| Migrazione schema | Prisma Migrate oppure Flyway |
| Stampa | `window.print()` con CSS `@media print` dedicato |

> **SQLite** è ideale per installazioni single-device (un solo PC cassa). **PostgreSQL** è consigliato appena si vuole accesso da più dispositivi (es. cassa + tablet cucina). Lo schema SQL è identico per entrambi, cambia solo il driver.

---

## 3. Moduli Principali

### 3.1 Gestione Menu (Admin)
### 3.2 Gestione Ordinazioni (Asporto)
### 3.3 Riepilogo e Stampa Comanda

---

## 4. Requisiti Funzionali

### 4.1 Modulo Menu — Inserimento, Modifica, Eliminazione Pizze

#### 4.1.1 Struttura dati di una Pizza

```json
{
  "id": "uuid-unico",
  "nome": "Margherita",
  "descrizione": "Pomodoro, mozzarella, basilico",
  "categoria": "Classiche",
  "prezzo_base": 7.50,
  "ingredienti": ["pomodoro", "mozzarella", "basilico"],
  "disponibile": true,
  "immagine_url": "optional"
}
```

#### 4.1.2 Funzionalità richieste

- **Inserimento nuova pizza**
  - Form con campi: nome, descrizione, categoria, prezzo base, ingredienti (tag inseribili), disponibilità (toggle on/off)
  - Validazione: nome obbligatorio, prezzo > 0, almeno un ingrediente
  - Feedback visivo su salvataggio riuscito o errore

- **Modifica pizza esistente**
  - Lista pizze con pulsante "Modifica" per ciascuna
  - Form precompilato con i dati attuali
  - Aggiornamento immediato riflesso in tutte le ordinazioni aperte

- **Eliminazione pizza**
  - Dialog di conferma prima dell'eliminazione
  - Soft-delete consigliato: segnare come `disponibile: false` anziché rimuovere dal DB per preservare lo storico degli ordini
  - Opzione "Nascondi dal menu" distinta da "Elimina definitivamente"

- **Visualizzazione menu admin**
  - Tabella o card grid con: nome, categoria, prezzo, stato disponibilità
  - Filtro per categoria
  - Ricerca per nome

---

### 4.2 Modulo Aggiunte / Modifiche Pizza

Ogni pizza nell'ordine può essere personalizzata. Le aggiunte hanno un costo aggiuntivo.

#### 4.2.1 Struttura dati Aggiunta

```json
{
  "id": "uuid-aggiunta",
  "nome": "Mozzarella extra",
  "prezzo": 1.00,
  "categoria": "Formaggi"
}
```

#### 4.2.2 Funzionalità

- Pannello aggiunte configurabile (gestito anch'esso dall'admin: CRUD completo)
- Selezione multipla di aggiunte per singola pizza
- Campo testo libero "Note" per modifiche speciali (es. "senza aglio", "ben cotta")
- Il prezzo totale della singola pizza = `prezzo_base + Σ(prezzi aggiunte selezionate)`

---

### 4.3 Modulo Ordinazione

#### 4.3.1 Struttura dati di un'Ordinazione

```json
{
  "id": "uuid-ordine",
  "numero_ordine": 42,
  "nome_cliente": "Mario Rossi",
  "telefono_cliente": "333 1234567",
  "orario_ordine": "2025-05-05T20:15:00",
  "orario_consegna": "2025-05-05T21:00:00",
  "tipo_ritiro": "asporto",
  "stato": "in_corso",
  "pizze": [
    {
      "pizza_id": "uuid-pizza",
      "nome_pizza": "Diavola",
      "prezzo_base": 8.50,
      "aggiunte": [
        { "nome": "Mozzarella extra", "prezzo": 1.00 }
      ],
      "note": "Senza peperoncino",
      "prezzo_totale_voce": 9.50
    }
  ],
  "totale_ordine": 9.50,
  "note_generali": "Allergia alle noci"
}
```

#### 4.3.2 Flusso di creazione ordinazione

1. **Avvia nuovo ordine**
   - Inserire **nome del cliente** (obbligatorio)
   - Inserire **numero di telefono** del cliente (consigliato, per richiami in caso di problemi)
   - Inserire **orario di consegna / ritiro concordato** (obbligatorio) — selezionabile tramite time-picker con incrementi di 5 minuti; non può essere antecedente all'orario corrente
   - Tipo ritiro: **Asporto** (ritiro in cassa) — campo predefinito, estendibile a "Domicilio" in futuro
   - L'orario di ricezione ordine viene registrato automaticamente
   - Numero ordine progressivo auto-generato

2. **Selezione pizze**
   - Visualizzare il menu disponibile (filtrato per categoria, ricercabile)
   - Click su pizza → aggiunta all'ordine
   - Possibilità di aggiungere la stessa pizza più volte (istanze separate, personalizzabili individualmente)

3. **Personalizzazione singola voce**
   - Per ogni pizza aggiunta: pannello espandibile con selezione aggiunte e campo note
   - Prezzo voce aggiornato in tempo reale

4. **Riepilogo ordine live**
   - Colonna/pannello laterale sempre visibile con le pizze nell'ordine corrente
   - Subtotale per voce e totale complessivo
   - Possibilità di rimuovere singole voci o svuotare l'ordine

5. **Conferma e invio**
   - Pulsante "Conferma Ordine" salva l'ordine e lo rende disponibile per la stampa
   - Dopo la conferma l'ordine diventa non modificabile (o con sblocco esplicito)

---

### 4.4 Modulo Stampa

#### 4.4.1 Layout scontrino / comanda

Il documento stampato deve contenere:

```
============================================
         🍕 PIZZERIA [Nome Locale]
============================================
Ordine n°: 42
Cliente:   Mario Rossi
Tel:       333 1234567
--------------------------------------------
Ricevuto:  05/05/2025 — 20:15
⏰ PRONTO ALLE: 21:00
--------------------------------------------
1x Diavola                          €  8,50
   + Mozzarella extra               €  1,00
   Note: Senza peperoncino
--------------------------------------------
2x Margherita                       € 15,00
--------------------------------------------
Note generali: Allergia alle noci
============================================
TOTALE                              € 24,50
============================================
```

> L'orario di consegna **⏰ PRONTO ALLE** deve essere stampato in evidenza (font più grande o in grassetto) sia sulla comanda cucina che sullo scontrino cliente, per evitare confusioni nei momenti di punta.

#### 4.4.2 Requisiti tecnici stampa

- CSS `@media print` con:
  - Nascondere navigazione, barre laterali, pulsanti di azione
  - Font monocromatico leggibile (es. monospace o serif semplice)
  - Layout A4 o formato scontrino (80mm)
  - **Orario di consegna** in corpo testo maggiorato (almeno 14pt) e in grassetto
- Pulsante "🖨 Stampa" visibile nel dettaglio ordine
- Opzione: stampa **comanda cucina** (pizze + modifiche + orario consegna, senza prezzi) vs **scontrino cliente** (con prezzi, totale e orario consegna)
- `window.print()` triggerato da pulsante dedicato
- **Ordinamento comande cucina** per orario di consegna crescente, così la cucina lavora in sequenza temporale

---

## 5. Requisiti Non Funzionali

| Requisito | Dettaglio |
|---|---|
| Responsività | Utilizzabile su tablet (principale) e desktop |
| Performance | Query sul DB < 100ms; risposta API < 300ms per operazioni CRUD |
| Accessibilità | Labels ARIA su form, contrasto WCAG AA |
| Integrità dati | Vincoli SQL (CHECK, FK, UNIQUE) applicati a livello di DB, non solo frontend |
| Sicurezza | Query parametrizzate (no SQL injection); variabili d'ambiente per credenziali DB |
| Backup | Dump SQL automatico giornaliero (`pg_dump` / backup SQLite); retention 30 giorni |
| UX | Feedback immediato su ogni azione (toast, highlight, badge) |

---

## 6. Struttura delle Schermate (Navigation)

```
App
├── /menu-admin          → Gestione pizze e aggiunte (CRUD)
│   ├── Lista pizze
│   ├── Aggiungi pizza
│   ├── Modifica pizza
│   └── Gestione aggiunte
│
├── /ordini              → Lista ordini attivi e storici
│   ├── Ordini in corso
│   └── Storico ordini
│
├── /ordini/nuovo        → Creazione nuovo ordine
│   ├── Anagrafica cliente
│   ├── Selezione pizze
│   ├── Personalizzazione voci
│   └── Riepilogo + Conferma
│
└── /ordini/:id          → Dettaglio ordine
    ├── Riepilogo completo
    ├── Stampa comanda cucina
    └── Stampa scontrino cliente
```

---

## 7. Modello Dati Completo — Schema SQL

### 7.1 Diagramma Entità-Relazione (ERD)

```
categorie_pizza ──< pizze >──────────────────< voci_ordine >── ordini
                     │                              │
              pizza_ingredienti           voce_aggiunte_selezionate
                                                    │
categorie_aggiunta ──< aggiunte >──────────────────┘
```

### 7.2 Script DDL Completo

#### Tabella: `categorie_pizza`
```sql
CREATE TABLE categorie_pizza (
    id       SERIAL PRIMARY KEY,
    nome     VARCHAR(60) NOT NULL UNIQUE,
    ordine   SMALLINT    NOT NULL DEFAULT 0  -- per ordinamento nel menu
);

INSERT INTO categorie_pizza (nome, ordine) VALUES
    ('Classiche', 1),
    ('Speciali',  2),
    ('Bianche',   3),
    ('Calzoni',   4);
```

---

#### Tabella: `pizze`
```sql
CREATE TABLE pizze (
    id              SERIAL PRIMARY KEY,
    nome            VARCHAR(100)   NOT NULL UNIQUE,
    descrizione     TEXT,
    categoria_id    INT            NOT NULL REFERENCES categorie_pizza(id),
    prezzo_base     NUMERIC(6,2)   NOT NULL CHECK (prezzo_base > 0),
    disponibile     BOOLEAN        NOT NULL DEFAULT TRUE,
    immagine_url    TEXT,
    creato_il       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    modificato_il   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pizze_categoria  ON pizze(categoria_id);
CREATE INDEX idx_pizze_disponibile ON pizze(disponibile);
```

---

#### Tabella: `ingredienti`
```sql
CREATE TABLE ingredienti (
    id    SERIAL PRIMARY KEY,
    nome  VARCHAR(80) NOT NULL UNIQUE
);
```

#### Tabella ponte: `pizza_ingredienti`
```sql
CREATE TABLE pizza_ingredienti (
    pizza_id      INT NOT NULL REFERENCES pizze(id) ON DELETE CASCADE,
    ingrediente_id INT NOT NULL REFERENCES ingredienti(id),
    PRIMARY KEY (pizza_id, ingrediente_id)
);
```

---

#### Tabella: `categorie_aggiunta`
```sql
CREATE TABLE categorie_aggiunta (
    id    SERIAL PRIMARY KEY,
    nome  VARCHAR(60) NOT NULL UNIQUE  -- es. 'Formaggi', 'Salumi', 'Verdure'
);
```

#### Tabella: `aggiunte`
```sql
CREATE TABLE aggiunte (
    id            SERIAL PRIMARY KEY,
    nome          VARCHAR(100)  NOT NULL UNIQUE,
    prezzo        NUMERIC(5,2)  NOT NULL DEFAULT 0.00 CHECK (prezzo >= 0),
    categoria_id  INT           REFERENCES categorie_aggiunta(id),
    disponibile   BOOLEAN       NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_aggiunte_categoria ON aggiunte(categoria_id);
```

---

#### Tabella: `ordini`
```sql
CREATE TYPE stato_ordine   AS ENUM ('in_corso','confermato','pronto','ritirato','annullato');
CREATE TYPE tipo_ritiro_t  AS ENUM ('asporto','domicilio');

CREATE TABLE ordini (
    id                SERIAL PRIMARY KEY,
    numero_ordine     INT             NOT NULL,  -- progressivo giornaliero
    data_ordine       DATE            NOT NULL DEFAULT CURRENT_DATE,
    nome_cliente      VARCHAR(120)    NOT NULL,
    telefono_cliente  VARCHAR(30),
    orario_ordine     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    orario_consegna   TIMESTAMPTZ     NOT NULL,
    tipo_ritiro       tipo_ritiro_t   NOT NULL DEFAULT 'asporto',
    stato             stato_ordine    NOT NULL DEFAULT 'in_corso',
    note_generali     TEXT,
    totale_ordine     NUMERIC(8,2)    NOT NULL DEFAULT 0.00,
    creato_il         TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    modificato_il     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- numero_ordine unico per giornata operativa
    UNIQUE (numero_ordine, data_ordine),
    -- orario consegna deve essere nel futuro rispetto alla ricezione
    CONSTRAINT chk_orario_consegna CHECK (orario_consegna >= orario_ordine)
);

CREATE INDEX idx_ordini_data          ON ordini(data_ordine);
CREATE INDEX idx_ordini_stato         ON ordini(stato);
CREATE INDEX idx_ordini_consegna      ON ordini(orario_consegna);
```

---

#### Tabella: `voci_ordine`
```sql
CREATE TABLE voci_ordine (
    id                   SERIAL PRIMARY KEY,
    ordine_id            INT           NOT NULL REFERENCES ordini(id) ON DELETE CASCADE,
    pizza_id             INT           REFERENCES pizze(id) ON DELETE SET NULL,

    -- Snapshot al momento dell'ordine (immune a modifiche future del listino)
    nome_pizza_snapshot      VARCHAR(100)  NOT NULL,
    prezzo_base_snapshot     NUMERIC(6,2)  NOT NULL,

    note                 TEXT,
    prezzo_totale_voce   NUMERIC(8,2)  NOT NULL,  -- base + aggiunte
    posizione            SMALLINT      NOT NULL DEFAULT 1  -- ordine di stampa
);

CREATE INDEX idx_voci_ordine_ordine ON voci_ordine(ordine_id);
```

---

#### Tabella: `voce_aggiunte_selezionate`
```sql
CREATE TABLE voce_aggiunte_selezionate (
    id              SERIAL PRIMARY KEY,
    voce_ordine_id  INT          NOT NULL REFERENCES voci_ordine(id) ON DELETE CASCADE,
    aggiunta_id     INT          REFERENCES aggiunte(id) ON DELETE SET NULL,

    -- Snapshot nome e prezzo al momento dell'ordine
    nome_aggiunta_snapshot   VARCHAR(100) NOT NULL,
    prezzo_aggiunta_snapshot NUMERIC(5,2) NOT NULL
);

CREATE INDEX idx_vas_voce ON voce_aggiunte_selezionate(voce_ordine_id);
```

---

### 7.3 Trigger — Aggiornamento automatico `modificato_il`

```sql
-- Funzione generica per aggiornare il timestamp
CREATE OR REPLACE FUNCTION fn_set_modificato_il()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modificato_il = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger su pizze
CREATE TRIGGER trg_pizze_modificato_il
    BEFORE UPDATE ON pizze
    FOR EACH ROW EXECUTE FUNCTION fn_set_modificato_il();

-- Trigger su ordini
CREATE TRIGGER trg_ordini_modificato_il
    BEFORE UPDATE ON ordini
    FOR EACH ROW EXECUTE FUNCTION fn_set_modificato_il();
```

---

### 7.4 Trigger — Numero ordine progressivo giornaliero

```sql
CREATE OR REPLACE FUNCTION fn_genera_numero_ordine()
RETURNS TRIGGER AS $$
DECLARE
    ultimo_numero INT;
BEGIN
    SELECT COALESCE(MAX(numero_ordine), 0)
    INTO   ultimo_numero
    FROM   ordini
    WHERE  data_ordine = CURRENT_DATE;

    NEW.numero_ordine = ultimo_numero + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_numero_ordine
    BEFORE INSERT ON ordini
    FOR EACH ROW EXECUTE FUNCTION fn_genera_numero_ordine();
```

---

### 7.5 Trigger — Ricalcolo automatico `totale_ordine`

```sql
CREATE OR REPLACE FUNCTION fn_ricalcola_totale_ordine()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE ordini
    SET    totale_ordine = (
               SELECT COALESCE(SUM(prezzo_totale_voce), 0)
               FROM   voci_ordine
               WHERE  ordine_id = COALESCE(NEW.ordine_id, OLD.ordine_id)
           )
    WHERE  id = COALESCE(NEW.ordine_id, OLD.ordine_id);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_totale_ordine
    AFTER INSERT OR UPDATE OR DELETE ON voci_ordine
    FOR EACH ROW EXECUTE FUNCTION fn_ricalcola_totale_ordine();
```

---

### 7.6 View — Ordini attivi con dettaglio

```sql
CREATE VIEW v_ordini_attivi AS
SELECT
    o.id,
    o.numero_ordine,
    o.nome_cliente,
    o.telefono_cliente,
    o.orario_ordine,
    o.orario_consegna,
    o.tipo_ritiro,
    o.stato,
    o.totale_ordine,
    o.note_generali,
    -- minuti mancanti alla consegna (negativo = in ritardo)
    EXTRACT(EPOCH FROM (o.orario_consegna - NOW())) / 60 AS minuti_alla_consegna
FROM ordini o
WHERE o.stato NOT IN ('ritirato', 'annullato')
ORDER BY o.orario_consegna ASC;
```

---

### 7.7 View — Dettaglio completo voce ordine

```sql
CREATE VIEW v_dettaglio_voci AS
SELECT
    vo.id            AS voce_id,
    vo.ordine_id,
    vo.posizione,
    vo.nome_pizza_snapshot,
    vo.prezzo_base_snapshot,
    vo.note,
    vo.prezzo_totale_voce,
    -- aggiunte come JSON array
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'nome',   vas.nome_aggiunta_snapshot,
                'prezzo', vas.prezzo_aggiunta_snapshot
            )
        ) FILTER (WHERE vas.id IS NOT NULL),
        '[]'
    ) AS aggiunte
FROM voci_ordine vo
LEFT JOIN voce_aggiunte_selezionate vas ON vas.voce_ordine_id = vo.id
GROUP BY vo.id;
```

---

### 7.8 Query Operative Principali

#### Nuovo ordine
```sql
INSERT INTO ordini (nome_cliente, telefono_cliente, orario_consegna, note_generali)
VALUES ('Mario Rossi', '333 1234567', '2025-05-05 21:00:00+02', 'Allergia alle noci')
RETURNING id, numero_ordine, orario_ordine;
```

#### Aggiungi voce all'ordine
```sql
-- 1. Inserisci la voce
INSERT INTO voci_ordine
    (ordine_id, pizza_id, nome_pizza_snapshot, prezzo_base_snapshot, note, prezzo_totale_voce, posizione)
VALUES
    (42, 7, 'Diavola', 8.50, 'Senza peperoncino', 9.50, 1)
RETURNING id;

-- 2. Inserisci le aggiunte selezionate
INSERT INTO voce_aggiunte_selezionate
    (voce_ordine_id, aggiunta_id, nome_aggiunta_snapshot, prezzo_aggiunta_snapshot)
VALUES
    (101, 3, 'Mozzarella extra', 1.00);
-- Il trigger fn_ricalcola_totale_ordine aggiorna ordini.totale_ordine automaticamente
```

#### Lista ordini attivi (schermata operatore)
```sql
SELECT * FROM v_ordini_attivi;
```

#### Dettaglio ordine completo per stampa
```sql
SELECT
    o.*,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'posizione',          vd.posizione,
            'nome_pizza',         vd.nome_pizza_snapshot,
            'prezzo_base',        vd.prezzo_base_snapshot,
            'note',               vd.note,
            'prezzo_totale_voce', vd.prezzo_totale_voce,
            'aggiunte',           vd.aggiunte
        ) ORDER BY vd.posizione
    ) AS voci
FROM ordini o
JOIN v_dettaglio_voci vd ON vd.ordine_id = o.id
WHERE o.id = :ordine_id
GROUP BY o.id;
```

#### Storico ordini per data
```sql
SELECT
    o.numero_ordine,
    o.nome_cliente,
    o.orario_consegna,
    o.stato,
    o.totale_ordine
FROM ordini o
WHERE o.data_ordine = :data          -- es. '2025-05-05'
ORDER BY o.orario_consegna;
```

#### Ricerca pizze disponibili per il menu
```sql
SELECT
    p.id,
    p.nome,
    p.descrizione,
    cp.nome AS categoria,
    p.prezzo_base,
    -- ingredienti come array di stringhe
    ARRAY_AGG(i.nome ORDER BY i.nome) AS ingredienti
FROM pizze p
JOIN categorie_pizza cp    ON cp.id = p.categoria_id
LEFT JOIN pizza_ingredienti pi ON pi.pizza_id = p.id
LEFT JOIN ingredienti i    ON i.id = pi.ingrediente_id
WHERE p.disponibile = TRUE
GROUP BY p.id, cp.nome
ORDER BY cp.ordine, p.nome;
```

---

### 7.9 Dati Seed (popolazione iniziale)

```sql
-- Ingredienti base
INSERT INTO ingredienti (nome) VALUES
    ('pomodoro'), ('mozzarella'), ('basilico'), ('origano'),
    ('prosciutto cotto'), ('funghi'), ('salame piccante'),
    ('gorgonzola'), ('rucola'), ('bresaola'), ('olive');

-- Pizze di esempio
INSERT INTO pizze (nome, descrizione, categoria_id, prezzo_base) VALUES
    ('Margherita',  'Pomodoro, mozzarella, basilico',              1, 7.00),
    ('Marinara',    'Pomodoro, aglio, origano',                    1, 6.00),
    ('Diavola',     'Pomodoro, mozzarella, salame piccante',       1, 8.50),
    ('Prosciutto',  'Pomodoro, mozzarella, prosciutto cotto',      1, 8.50),
    ('Quattro Stagioni', 'Pomodoro, mozzarella, funghi, olive, prosciutto', 2, 9.50),
    ('Gorgonzola',  'Mozzarella, gorgonzola',                      3, 9.00),
    ('Bresaola',    'Mozzarella, bresaola, rucola, grana',         2, 10.50);

-- Categorie aggiunta
INSERT INTO categorie_aggiunta (nome) VALUES
    ('Formaggi'), ('Salumi'), ('Verdure'), ('Extra');

-- Aggiunte disponibili
INSERT INTO aggiunte (nome, prezzo, categoria_id) VALUES
    ('Mozzarella extra',   1.00, 1),
    ('Gorgonzola',         1.50, 1),
    ('Prosciutto cotto',   1.50, 2),
    ('Speck',              1.50, 2),
    ('Funghi',             1.00, 3),
    ('Olive',              0.80, 3),
    ('Rucola',             0.80, 3),
    ('Doppio impasto',     1.00, 4),
    ('Bordo ripieno',      1.50, 4);
```

---

### 7.10 Schema di Migrazione (Prisma)

```prisma
// schema.prisma — equivalente Prisma del DDL SQL sopra

datasource db {
  provider = "postgresql"   // oppure "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model CategoriaPizza {
  id     Int     @id @default(autoincrement())
  nome   String  @unique @db.VarChar(60)
  ordine Int     @default(0) @db.SmallInt
  pizze  Pizza[]

  @@map("categorie_pizza")
}

model Pizza {
  id           Int            @id @default(autoincrement())
  nome         String         @unique @db.VarChar(100)
  descrizione  String?
  categoriaId  Int            @map("categoria_id")
  prezzoBase   Decimal        @map("prezzo_base") @db.Decimal(6, 2)
  disponibile  Boolean        @default(true)
  immagineUrl  String?        @map("immagine_url")
  creatoPL     DateTime       @default(now()) @map("creato_il")
  modificatoIl DateTime       @default(now()) @map("modificato_il")
  categoria    CategoriaPizza @relation(fields: [categoriaId], references: [id])
  ingredienti  PizzaIngrediente[]
  voci         VoceOrdine[]

  @@map("pizze")
}

model Ordine {
  id               Int          @id @default(autoincrement())
  numeroOrdine     Int          @map("numero_ordine")
  dataOrdine       DateTime     @default(dbgenerated("CURRENT_DATE")) @map("data_ordine") @db.Date
  nomeCliente      String       @map("nome_cliente") @db.VarChar(120)
  telefonoCliente  String?      @map("telefono_cliente") @db.VarChar(30)
  orarioOrdine     DateTime     @default(now()) @map("orario_ordine")
  orarioConsegna   DateTime     @map("orario_consegna")
  tipoRitiro       TipoRitiro   @default(asporto) @map("tipo_ritiro")
  stato            StatoOrdine  @default(in_corso)
  noteGenerali     String?      @map("note_generali")
  totaleOrdine     Decimal      @default(0) @map("totale_ordine") @db.Decimal(8, 2)
  voci             VoceOrdine[]

  @@unique([numeroOrdine, dataOrdine])
  @@map("ordini")
}

enum StatoOrdine {
  in_corso
  confermato
  pronto
  ritirato
  annullato
}

enum TipoRitiro {
  asporto
  domicilio
}
```

> Per SQLite con Prisma, rimuovere gli `@db.*` decorator e impostare `provider = "sqlite"` nel datasource. Gli ENUM diventano `String` con validazione applicativa.

---

## 8. Procedure di Sviluppo

### Fase 1 — Setup Progetto e Database (2-3 giorni)
- [ ] Inizializzare progetto Node.js + Express (backend) e React (frontend)
- [ ] Installare dipendenze: `prisma`, `@prisma/client`, `pg` / `better-sqlite3`
- [ ] Configurare `DATABASE_URL` in `.env` (SQLite per sviluppo, PostgreSQL per produzione)
- [ ] Eseguire `prisma init` e incollare lo schema `schema.prisma` (sezione 7.10)
- [ ] Eseguire `prisma migrate dev --name init` per creare le tabelle
- [ ] Eseguire lo script seed SQL (sezione 7.9) per i dati iniziali
- [ ] Verificare le tabelle con `prisma studio` o un client SQL (DBeaver, TablePlus)
- [ ] Definire struttura cartelle REST API (`/routes`, `/controllers`, `/db`)
- [ ] Creare modelli TypeScript / JSDoc per le entità

### Fase 2 — Modulo Menu Admin (2-3 giorni)
- [ ] Lista pizze con tabella/card
- [ ] Form aggiungi pizza con validazione
- [ ] Form modifica pizza precompilato
- [ ] Dialog di conferma eliminazione / disabilitazione
- [ ] CRUD aggiunte

### Fase 3 — Modulo Ordinazione (3-4 giorni)
- [ ] Schermata nuovo ordine: form anagrafica (nome, telefono, orario consegna)
- [ ] Time-picker per orario di consegna con incrementi da 5 minuti
- [ ] Griglia menu selezionabile con categorie
- [ ] Pannello personalizzazione voce (aggiunte + note)
- [ ] Riepilogo ordine live con calcolo totale
- [ ] Salvataggio e conferma ordine
- [ ] Lista ordini ordinata per orario di consegna crescente

### Fase 4 — Stampa (1 giorno)
- [ ] Layout scontrino con CSS `@media print`
- [ ] Pulsante stampa comanda cucina
- [ ] Pulsante stampa scontrino cliente
- [ ] Test stampa su foglio A4 e formato 80mm

### Fase 5 — Rifinitura (1-2 giorni)
- [ ] Lista ordini con filtro per stato
- [ ] Toast / feedback visivi
- [ ] Test responsività su tablet
- [ ] Revisione UX generale

---

## 9. Casi d'Uso Principali (User Stories)

| ID | Come... | Voglio... | Per... |
|---|---|---|---|
| US-01 | Operatore | aprire un nuovo ordine con nome e telefono cliente | identificare il cliente al ritiro |
| US-02 | Operatore | impostare l'orario di consegna concordato | rispettare i tempi promessi |
| US-03 | Operatore | aggiungere più pizze a un ordine | gestire ordini multipli |
| US-04 | Operatore | personalizzare ogni pizza con aggiunte e note | rispettare le richieste del cliente |
| US-05 | Operatore | vedere il totale aggiornato in tempo reale | comunicare il costo al cliente al telefono |
| US-06 | Operatore | stampare la comanda per la cucina con l'orario di consegna | far preparare la pizza in tempo |
| US-07 | Operatore | stampare lo scontrino al cliente con l'orario di ritiro | confermare l'accordo al momento del pagamento |
| US-08 | Operatore | vedere la lista ordini ordinata per orario di consegna | gestire i picchi di lavoro |
| US-09 | Admin | aggiungere una nuova pizza al menu | aggiornare l'offerta del ristorante |
| US-10 | Admin | modificare il prezzo di una pizza | adeguare i prezzi |
| US-11 | Admin | disabilitare una pizza esaurita | evitare ordini non evadibili |
| US-12 | Admin | gestire le aggiunte disponibili e i loro costi | tenere il listino aggiornato |

---

## 10. Note e Considerazioni Aggiuntive

- **Numero ordine progressivo**: resettato automaticamente ogni giorno dal trigger `fn_genera_numero_ordine`. Per l'asporto è utile un numero breve (es. 1–99) chiamabile a voce al bancone.
- **Orario di ricezione ordine**: impostato automaticamente dal DB (`DEFAULT NOW()`); non modificabile dall'utente.
- **Orario di consegna**: inserito manualmente dall'operatore; modificabile fino alla conferma stampa. Il vincolo `chk_orario_consegna` impedisce valori nel passato rispetto all'orario di ricezione.
- **Avvisi scadenza**: la view `v_ordini_attivi` espone `minuti_alla_consegna`; il frontend evidenzia in rosso/arancio le righe con valore ≤ 20.
- **Snapshot prezzi**: nome e prezzo vengono copiati in `nome_pizza_snapshot`, `prezzo_base_snapshot`, `nome_aggiunta_snapshot`, `prezzo_aggiunta_snapshot` al momento dell'inserimento voce. Modifiche future al listino non alterano gli ordini storici.
- **Backup automatico**: configurare uno script cron (`0 3 * * * pg_dump pizzaorder > /backup/$(date +\%F).sql`) per dump notturno. Per SQLite: copia del file `.db`.
- **Multi-lingua**: predisporre le stringhe UI in un file `i18n.js` se si prevede espansione internazionale.
- **Dark mode**: consigliata per ambienti con luci basse o uso serale intensivo.
- **Integrazione futura**: la struttura SQL è predisposta per l'estensione a consegne a domicilio (aggiungere colonna `indirizzo_consegna` in `ordini`) e per l'integrazione con stampanti fiscali tramite API esterne.
