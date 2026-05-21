# Repository Journal - Sentinel

## Security Learnings
1. **JWT Secrets**: Never hardcode JWT secrets or cryptographic keys directly in source code. Always ensure they are strictly loaded from environment variables (e.g., `process.env.JWT_SECRET`) and implement a fallback check that exits the application gracefully if the secret is undefined to prevent unauthorized access via a predictable default secret.
2. **Database Commits**: Avoid committing local SQLite database files (e.g., `dev.db`) to version control to prevent leaking sensitive data or credential hashes.

## Common Codebase Patterns
- **Zustand State Management**: When adding new fields to an entity in the backend (e.g. `metodoPagamento`, `scontoFisso` to `Ordini`), always remember to update the corresponding Zustand store initialization and load functions (e.g. `loadOrdine` in `orderStore.ts`) to prevent data loss during editing.
- **Server Validation**: Backend APIs handling creation and updates (e.g., `POST` and `PUT` requests) must both implement duplicate validation logic (such as checking capacity limits or permissions) to prevent users from bypassing restrictions by modifying an existing entity.