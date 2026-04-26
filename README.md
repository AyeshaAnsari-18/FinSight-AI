# FinSight AI

FinSight AI is an enterprise finance, bookkeeping, audit, and compliance platform built around a NestJS backend, React frontend, and a FastAPI AI engine.

## Security Model

This project uses layered security, not literal client-side end-to-end encryption. Because the backend and engine must read business data to process journals, reconciliations, reports, OCR, and copilots, the practical model is:

- Transport security over HTTPS/TLS in deployment.
- Password hashing with Argon2.
- Refresh token hashing with Argon2.
- Sensitive business fields encrypted at rest with AES-256-GCM.
- File artifacts such as uploaded invoices, generated reports, and admin-test PDFs stored encrypted on disk.
- Prompt-injection hardening inside the engine so user, OCR, and database content is treated as untrusted data.

### What is hashed

- `User.password`
- `User.hashedRefreshToken`

### What is encrypted at rest

Backend database fields are encrypted before save and decrypted in service code before use:

- Journal entries: `description`, `reference`, `flagReason`
- Reconciliations: `notes`
- Tasks: `title`, `description`
- Policies: `title`, `content`, `category`
- Audit logs: `details`, `ipAddress`
- Risk controls: `riskName`, `controlDesc`
- Chat history: `content`
- Documents / reports: `fileName`, `fileUrl`, `generatedFileUrl`, `fileType`, `extractedText`, `summary`
- Admin test reports: `title`, `status`, `mode`, `summary`, `results`, `pdfPath`, `reportUrl`, `createdBy`

PDF files are stored in encrypted form under:

- `backend/storage/documents`
- `backend/storage/admin-test-reports`

### Encryption details

- Algorithm: AES-256-GCM
- Envelope format: `enc:v1|iv|tag|ciphertext`
- Key source: `DATA_ENCRYPTION_KEY` in `backend/.env`
- Existing plaintext rows and files can be re-saved with:

```bash
cd backend
npm run backfill:security
```

## How the flow works

1. The frontend sends a normal HTTPS request.
2. The backend encrypts sensitive text fields before writing to Postgres or local storage.
3. The backend stores hashed auth secrets and encrypted business data.
4. When the app needs to display data, the backend decrypts only the fields it needs for that trusted request.
5. The engine receives only the minimum trusted payload it needs, and all database/history/OCR content is labeled as untrusted in prompts.

## Engine Hardening

The engine prompts now use a security preamble that:

- Treats OCR text, database context, and conversation history as untrusted.
- Rejects prompt injection attempts that try to override system instructions.
- Forces structured output where JSON is expected.
- Keeps role-based access control explicit in the copilot flow.

This reduces prompt-engineering risk, but it does not make server-side AI magically tamper-proof. The real safety boundary is still trusted backend code plus strict role checks plus encrypted-at-rest storage.

## Project Layout

- `backend` - NestJS REST API, auth, journals, reconciliation, reports, admin-test, and database access.
- `client` - React/Vite/Tailwind frontend.
- `engine` - FastAPI AI orchestrator and LangChain agents.

## Useful Commands

Backend:

```bash
cd backend
npm install
npm run build
npm test -- --runInBand
npm run backfill:security
```

Engine:

```bash
cd engine
python -m compileall .
```

