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
- `GET /cards` -> latest 100 saved cards
- `POST /upload` (`multipart/form-data`, field name `file`) -> parses Anki-style TXT and saves cards




 

