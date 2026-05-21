# Nuove Funzionalità Proposte per PizzaOrder

Basandoci sulla struttura attuale e sui requisiti esistenti (gestione asporto, menu, stampanti e orari), ecco una lista di funzionalità aggiuntive che potremmo implementare in futuro per migliorare e scalare l'applicazione:

## 1. Sicurezza e Ruoli (Autenticazione)
Attualmente il sistema è aperto. Implementare un sistema di autenticazione garantirebbe maggior controllo:
- **Login Operatori**: Accesso tramite PIN o username/password per i cassieri.
- **Ruoli (RBAC)**:
  - *Operatore*: Può solo creare/gestire ordini e stampare comande.
  - *Admin/Manager*: Può accedere al pannello "Menu Admin", vedere le statistiche di vendita, modificare i prezzi e gestire gli utenti.
- **Audit Logging Avanzato**: Oltre al log di sistema, tracciare quale operatore ha inserito, annullato o modificato un determinato ordine.

## 2. Pagamenti e Fatturazione Elettronica
- **Integrazione POS/Pagamenti Digitali**: Possibilità di segnare un ordine come "Pagato in Contanti" oppure "Pagato con Carta".
- **Gestione Resto**: Calcolatore automatico del resto al momento del pagamento in contanti.
- **Stampa Fiscale**: Integrazione con API di stampanti RT (Registratore Telematico) per l'emissione diretta di scontrini fiscali, invece del solo "scontrino di cortesia" attuale.

## 3. Gestione del Magazzino e delle Scorte
- **Distinta Base (BOM)**: Associare a ogni pizza/ingrediente una quantità esatta (es. 150g di farina, 80g di mozzarella).
- **Scalo Scorte Automatico**: Ad ogni ordine confermato/completato, il sistema riduce le scorte in magazzino.
- **Alert Scorte in Esaurimento**: Avvisi visivi sulla dashboard quando un ingrediente (es. mozzarella) scende sotto una soglia critica, con disabilitazione automatica dal menu delle pizze che lo richiedono.

## 4. App Cliente / Web App per l'Asporto
- **Frontend per Clienti (Self-Order)**: Un modulo o sito web separato dove i clienti finali possono esplorare il menu e inviare l'ordine dal proprio smartphone.
- **Ordini in Stato "Da Confermare"**: Gli ordini provenienti dal sito entrano in dashboard con un colore specifico e devono essere accettati dall'operatore.
- **Tracciamento Ordine**: Fornire al cliente un link SMS o web per vedere in tempo reale se la sua pizza è "In Preparazione" o "Pronta al Ritiro".

## 5. Coupon, Sconti e Gestione Clienti (CRM)
- **Database Clienti**: Anagrafica clienti arricchita (storico ordini per numero di telefono).
- **Sconti e Maggiorazioni**:
  - Applicare uno sconto manuale (es. -10% o -2.00€) sull'intero ordine.
  - Codici promozionali.
- **Fasce Orarie Dinamiche**: Limitare automaticamente il numero massimo di ordini (o pizze) accettabili per una specifica fascia oraria di 15 minuti, per non sovraccaricare la cucina.

## 6. Modulo Domicilio Avanzato
- **Gestione Fattorini (Rider)**: Assegnare un ordine in consegna a uno specifico driver.
- **Costi di Consegna Dinamici**: Aggiungere automaticamente un costo di consegna in base al CAP o alla zona, selezionabile in fase di nuovo ordine.

---

*Tutte queste funzionalità possono essere sviluppate modularmente partendo dal refactoring del backend attuale.*