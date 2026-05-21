# 🍕 Pizza Order App

Questa è una soluzione full-stack per la gestione degli ordini in pizzeria. L'applicazione include un backend in Node.js (Express, Prisma, SQLite) per la gestione delle API e del database, e un frontend in React (Vite, TailwindCSS) per la dashboard degli operatori.

## 🚀 Istruzioni per l'Hosting tramite Docker

L'applicazione è configurata per essere eseguita con facilità in qualsiasi ambiente che supporti Docker, utilizzando `docker-compose`. Grazie a questa configurazione, il database, le API backend e la dashboard frontend verranno attivati automaticamente e saranno pronti all'uso.

### Prerequisiti
* Assicurati che **Docker** e **Docker Compose** siano installati sulla tua macchina o sul server.

### 1. Avvio dei container

1. Apri un terminale nella cartella root del progetto (dove si trova il file `docker-compose.yml`).
2. Esegui il comando di build e avvio dei container:

   ```bash
   docker-compose up --build -d
   ```

   *L'opzione `-d` avvia i container in background.*

### 2. Accesso all'applicazione

Una volta che i container sono in esecuzione, l'applicazione sarà accessibile all'indirizzo del tuo server.
Se la stai eseguendo sul tuo computer in locale:

* **Dashboard Frontend (Browser)**: `http://localhost:80` (oppure semplicemente `http://localhost/`)
* **API Backend (Internamente e via proxy)**: Accessibile tramite `/api` grazie a Nginx (es. `http://localhost/api/menu`)

### 3. Gestione del Database e dei Dati

L'applicazione utilizza un database **SQLite** (`dev.db`).
* La directory del database è collegata a un **volume Docker** persistente (`sqlite-data`). Ciò significa che **i tuoi dati non andranno persi** al riavvio o all'aggiornamento dei container.
* Al primo avvio, l'applicazione genererà automaticamente il database e lo riempirà con i dati iniziali di prova (seed), come le pizze base e gli ingredienti principali.

### 4. Aggiornamento dell'applicazione
Se apporti modifiche al codice sorgente e vuoi riavviare l'applicazione in Docker:

```bash
docker-compose down
docker-compose up --build -d
```

---

## 💻 Guida per l'Implementazione in Locale (Sviluppo)

Tutto l'ambiente è già preconfigurato per funzionare immediatamente. Per eseguire l'applicazione in locale senza Docker, apri due terminali separati.

### 1. Avvio del Backend
Nel primo terminale, naviga nella cartella `backend`, installa le dipendenze e avvia il server (che configurerà in automatico il database SQLite `dev.db`):

```bash
cd backend
npm install
npm run start
```
Il backend sarà in ascolto sulla porta `3001`.

### 2. Avvio del Frontend
Nel secondo terminale, naviga nella cartella `frontend`, installa le dipendenze e avvia il server di sviluppo:

```bash
cd frontend
npm install
npm run dev
```
Il frontend sarà accessibile all'indirizzo `http://localhost:5173`.

---

## 📖 Guida per l'Utilizzo (Dashboard Operatori)

La dashboard, accessibile dal browser, consente di prendere rapidamente le comande e tenere traccia degli ordini attivi.

### Aggiungere un Nuovo Ordine
1. Recati alla pagina **"Nuovo Ordine"**.
2. **Cerca o seleziona le pizze**: Naviga attraverso le categorie nel menu e seleziona le pizze richieste dal cliente.
3. **Personalizza la pizza**: Quando aggiungi una pizza, puoi selezionare aggiunte extra (es. Mozzarella extra, Funghi) che aumenteranno automaticamente il prezzo. Puoi anche aggiungere una "Nota" testuale (es. "Ben cotta").
4. **Inserisci i dati del cliente**: Sulla colonna di destra (Riepilogo), inserisci il nome del cliente, opzionalmente il numero di telefono, e l'**Orario di Consegna**.
5. **Conferma Ordine**: Verifica il totale e clicca su "Conferma Ordine".

### Gestione degli Ordini Attivi
1. Recati alla pagina **"Ordini Attivi"**.
2. Qui troverai le schede per tutti gli ordini da completare. I colori aiutano a gestire l'urgenza:
   * **Verde**: Manca più di un quarto d'ora.
   * **Arancione**: Ordine in scadenza (meno di 15 minuti).
   * **Rosso**: Ordine in ritardo.
3. **Stampe**:
   * Clicca su **"Cucina"** per stampare la comanda con le posizioni, le note e le variazioni, senza riportare il prezzo.
   * Clicca su **"Scontrino"** per stampare il riepilogo con l'elenco dei prezzi per le singole voci e il totale da far pagare al cliente.

---

*L'applicazione è progettata per essere utilizzata sia da Desktop che da dispositivi Tablet (iPad) posti alla cassa della pizzeria.*
