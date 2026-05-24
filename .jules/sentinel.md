## 2024-05-24 - [Insecure Direct Object Reference / Client-Side Price Manipulation]
**Vulnerability:** The backend endpoint `POST /api/ordini` trusts the user-provided prices (`prezzoBase`, `prezzo` of additions, `sovrapprezzo` of doughs) coming from the frontend request to calculate `totaleOrdine` without validating them against the database.
**Learning:** This is a classic client-side price manipulation vulnerability. An attacker can send a modified request with negative or arbitrary prices to pay less or nothing for an order. Never trust client-provided prices.
**Prevention:** Always calculate prices on the server side using the identifiers (e.g., `pizzaId`, `aggiuntaId`, `impastoId`) to fetch the correct, authoritative prices from the database.
