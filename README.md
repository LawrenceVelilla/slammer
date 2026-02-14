# Slammer - Take studying to another level!!!

## Tech Stack

- **Electron** - Desktop application framework

**Frontend**
- React + Javascript
- TailwindCSS
- Vite


**Backend**
- Node.js + Express
- NoSQL (MongoDB)


**Root Directory**
- ```npm start``` to start the electron app
- ```npm run start:full``` to start frontend + backend + electron together

These scripts are configured to run on Windows, macOS, and Linux.

## MongoDB Setup
1. Copy `.env.example` to `.env` in the project root.
2. Set `MONGODB_URI` (local example: `mongodb://127.0.0.1:27017/slammer`).
3. Install server dependencies:
   - `cd server`
   - `npm install`
4. Start backend:
   - `npm run start`

## Backend Endpoints
- `GET /health` -> server + DB readiness state
- `GET /cards` -> paginated cards (`?deckId=<id>&page=1&limit=50&q=term&sourceFile=file.txt&sortBy=createdAt&sortOrder=desc`)
- `PATCH /cards/:cardId` -> update card fields (`front`, `back`, `frontHtml`, `backHtml`)
- `DELETE /cards/:cardId` -> delete a single card
- `POST /upload` (`multipart/form-data`, field name `file`) -> parses Anki-style TXT, creates/fetches deck, and saves cards
- `GET /decks` -> paginated decks (`?page=1&limit=50&q=biology&sortBy=name&sortOrder=asc`)
- `POST /decks` -> create deck (or return existing by name)
- `GET /decks/:deckId/cards` -> paginated cards for a specific deck
- `DELETE /decks/:deckId` -> delete deck and cascade delete its cards

Versioned API is also mounted at `/api/v1` with the same routes (for example `/api/v1/decks`).
`/api/v1` responses use envelope policy:
- Success: `{ "apiVersion": "v1", "data": { ... } }`
- Error: `{ "apiVersion": "v1", "error": "message" }`

## Verification
1. Start backend in one terminal:
   - `cd server`
   - `npm run start`
2. In another terminal run smoke test:
   - `cd server`
   - `npm run smoke`
   - `npm run smoke:v1`
   - `npm test` (integration tests)
   - `npm run migrate` (schema/data migrations)

## Auth (Local)
- Write routes (`POST`, `PATCH`, `DELETE`) require API key auth.
- Send header: `x-api-key: <LOCAL_API_KEY>` (or `Authorization: Bearer <LOCAL_API_KEY>`).

## Guardrails
- Rate limit is enabled (defaults: 120 requests/min per route+IP).
- JSON/urlencoded payload limit: `1mb`.
- Uploads only accept `.txt` files up to `2mb`.




 

