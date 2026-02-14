import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3000';
const API_PREFIX = process.argv[2] || '';
const AUTH_KEY = process.env.LOCAL_API_KEY || 'dev-local-key';
const SAMPLE_FILE = path.resolve(__dirname, '../uploads/BIOL 108 - CHAPTER 1.txt');
const TEST_DECK_NAME = `Smoke Deck ${Date.now()}`;
const endpoint = (route) => `${BASE_URL}${API_PREFIX}${route}`;

async function requestJson(url, options = {}) {
  const res = await fetch(url, options);
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  const data = body && body.apiVersion && body.data !== undefined ? body.data : body;
  const error = body && body.apiVersion && body.error ? body.error : null;
  return { ok: res.ok, status: res.status, data, body, error };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function run() {
  console.log(`SMOKE: checking ${API_PREFIX || '/'} routes`);
  console.log('SMOKE: checking /health');
  const health = await requestJson(endpoint('/health'));
  assert(health.ok, `Health failed with status ${health.status}`);
  assert(health.data?.ok === true, 'Health payload missing ok=true');
  assert(health.data?.dbState === 1, `Expected dbState=1, got ${health.data?.dbState}`);

  console.log('SMOKE: verifying unauthorized write is blocked');
  const unauthorizedCreate = await requestJson(endpoint('/decks'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: `${TEST_DECK_NAME}-unauthorized` }),
  });
  assert(unauthorizedCreate.status === 401, `Expected 401 for unauthorized write, got ${unauthorizedCreate.status}`);

  console.log('SMOKE: creating deck');
  const created = await requestJson(endpoint('/decks'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': AUTH_KEY },
    body: JSON.stringify({ name: TEST_DECK_NAME }),
  });
  assert(created.ok, `Deck create failed with status ${created.status}`);
  assert(created.data?.deck?._id, 'Deck create missing deck._id');
  const deckId = created.data.deck._id;

  console.log('SMOKE: uploading sample cards');
  const fileBuffer = await fs.readFile(SAMPLE_FILE);
  const form = new FormData();
  form.append('file', new Blob([fileBuffer], { type: 'text/plain' }), path.basename(SAMPLE_FILE));
  form.append('deckName', TEST_DECK_NAME);

  const upload = await requestJson(endpoint('/upload'), {
    method: 'POST',
    headers: { 'x-api-key': AUTH_KEY },
    body: form,
  });
  assert(upload.ok, `Upload failed with status ${upload.status}`);
  assert(upload.data?.totalSaved > 0, `Expected saved cards > 0, got ${upload.data?.totalSaved}`);
  assert(upload.data?.deckId === deckId, 'Upload deckId mismatch');

  console.log('SMOKE: reading deck cards');
  const deckCards = await requestJson(endpoint(`/decks/${deckId}/cards?limit=5&page=1`));
  assert(deckCards.ok, `Deck cards failed with status ${deckCards.status}`);
  assert(deckCards.data?.total === 5, `Expected 5 deck cards, got ${deckCards.data?.total}`);
  const sampleCardId = deckCards.data.cards?.[0]?._id;
  assert(sampleCardId, 'Expected a card id from deck cards response');

  console.log('SMOKE: updating a card');
  const patched = await requestJson(endpoint(`/cards/${sampleCardId}`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-api-key': AUTH_KEY },
    body: JSON.stringify({ front: 'SMOKE_UPDATED_FRONT' }),
  });
  assert(patched.ok, `Card patch failed with status ${patched.status}`);
  assert(patched.data?.card?.front === 'SMOKE_UPDATED_FRONT', 'Card patch did not persist front');

  console.log('SMOKE: validating bad deck id handling');
  const badDeck = await requestJson(endpoint('/decks/not-an-id/cards'));
  assert(badDeck.status === 400, `Expected 400 for bad id, got ${badDeck.status}`);

  console.log('SMOKE: deleting deck and cascading cards');
  const deleted = await requestJson(endpoint(`/decks/${deckId}`), {
    method: 'DELETE',
    headers: { 'x-api-key': AUTH_KEY },
  });
  assert(deleted.ok, `Deck delete failed with status ${deleted.status}`);
  assert(deleted.data?.deletedDeckId === deckId, 'Deleted deck id mismatch');
  assert(deleted.data?.deletedCards > 0, `Expected deletedCards > 0, got ${deleted.data?.deletedCards}`);

  console.log('SMOKE: deleting a card returns not found after deck cascade');
  const deletedCardAfterCascade = await requestJson(endpoint(`/cards/${sampleCardId}`), {
    method: 'DELETE',
    headers: { 'x-api-key': AUTH_KEY },
  });
  assert(deletedCardAfterCascade.status === 404, `Expected 404 after cascade, got ${deletedCardAfterCascade.status}`);

  console.log('SMOKE: ensuring deleted deck is not found');
  const deletedCardsFetch = await requestJson(endpoint(`/decks/${deckId}/cards`));
  assert(deletedCardsFetch.status === 404, `Expected 404 for deleted deck cards, got ${deletedCardsFetch.status}`);

  console.log('SMOKE: PASS');
}

run().catch((error) => {
  console.error(`SMOKE: FAIL - ${error.message}`);
  process.exit(1);
});
