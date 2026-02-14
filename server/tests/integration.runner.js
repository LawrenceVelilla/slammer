import assert from 'node:assert/strict';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs/promises';
import createApp from '../create-app.js';
import { connectDB } from '../db/config.js';
import Deck from '../models/Deck.js';
import Card from '../models/Card.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootEnvPath = path.resolve(__dirname, '../../.env');
const sampleFilePath = path.resolve(__dirname, '../uploads/BIOL 108 - CHAPTER 1.txt');
const authKey = process.env.LOCAL_API_KEY || 'dev-local-key';

dotenv.config({ path: rootEnvPath });

let server;
let baseUrl;

async function setup() {
  await connectDB();
  const app = createApp();
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
}

async function teardown() {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
  await mongoose.disconnect();
}

async function resetData() {
  await Card.deleteMany({});
  await Deck.deleteMany({});
}

async function run() {
  console.log('TEST: setup');
  await setup();

  try {
    await resetData();
    console.log('TEST: unauthorized write blocked');
    const unauthorized = await fetch(`${baseUrl}/decks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Unauthorized Deck' }),
    });
    assert.equal(unauthorized.status, 401);

    await resetData();
    console.log('TEST: create/upload/paginate flow');
    const createRes = await fetch(`${baseUrl}/decks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': authKey },
      body: JSON.stringify({ name: 'Integration Deck' }),
    });
    assert.equal(createRes.status, 201);
    const createPayload = await createRes.json();
    assert.ok(createPayload.deck?._id);
    const deckId = createPayload.deck._id;

    const fileBuffer = await fs.readFile(sampleFilePath);
    const form = new FormData();
    form.append('file', new Blob([fileBuffer], { type: 'text/plain' }), path.basename(sampleFilePath));
    form.append('deckName', 'Integration Deck');

    const uploadRes = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      headers: { 'x-api-key': authKey },
      body: form,
    });
    assert.equal(uploadRes.status, 200);
    const uploadPayload = await uploadRes.json();
    assert.equal(uploadPayload.deckId, deckId);
    assert.ok(uploadPayload.totalSaved > 0);

    const cardsRes = await fetch(`${baseUrl}/decks/${deckId}/cards?limit=10&page=1`);
    assert.equal(cardsRes.status, 200);
    const cardsPayload = await cardsRes.json();
    assert.equal(cardsPayload.total, 10);
    assert.ok(cardsPayload.meta.total >= 100);

    console.log('TEST: /api/v1 envelope');
    const v1Health = await fetch(`${baseUrl}/api/v1/health`);
    assert.equal(v1Health.status, 200);
    const payload = await v1Health.json();
    assert.equal(payload.apiVersion, 'v1');
    assert.equal(payload.data.ok, true);

    console.log('TEST: PASS');
  } finally {
    await teardown();
  }
}

run().catch((error) => {
  console.error(`TEST: FAIL - ${error.message}`);
  process.exit(1);
});
