import mongoose from 'mongoose';
import Card from '../models/Card.js';
import {
  getCardsForDeck,
  getCardsPage,
  importCardsFromFile,
  updateCardById,
  deleteCardById,
} from '../services/card-service.js';
import { parsePagination } from '../utils/pagination.js';
import { parseOptionalSearch, parseSort } from '../utils/query.js';

async function listCards(req, res) {
  const { page, limit } = parsePagination(req.query);
  const { sortBy, sortOrder } = parseSort(req.query, {
    defaultBy: 'createdAt',
    allowed: ['createdAt', 'updatedAt', 'front', 'back'],
  });
  const q = parseOptionalSearch(req.query);
  const deckId = req.query.deckId;
  const sourceFile = req.query.sourceFile;
  if (deckId && !mongoose.isValidObjectId(deckId)) {
    return res.status(400).json({ error: 'Invalid deckId' });
  }
  const result = await getCardsPage({ page, limit, deckId, q, sourceFile, sortBy, sortOrder });
  res.json({ total: result.cards.length, cards: result.cards, meta: result.meta });
}

async function listCardsByDeck(req, res) {
  const { deckId } = req.params;
  const { page, limit } = parsePagination(req.query);
  const { sortBy, sortOrder } = parseSort(req.query, {
    defaultBy: 'createdAt',
    allowed: ['createdAt', 'updatedAt', 'front', 'back'],
  });
  const q = parseOptionalSearch(req.query);
  const result = await getCardsForDeck(deckId, { page, limit, q, sortBy, sortOrder });
  res.json({ total: result.cards.length, cards: result.cards, meta: result.meta });
}

async function uploadCards(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const result = await importCardsFromFile(req.file, req.body.deckName, { requestId: req.requestId });
  return res.json(result);
}

async function patchCard(req, res) {
  const { cardId } = req.params;
  const card = await updateCardById(cardId, req.body, { requestId: req.requestId });
  res.json({ card });
}

async function removeCard(req, res) {
  const { cardId } = req.params;
  const result = await deleteCardById(cardId, { requestId: req.requestId });
  res.json(result);
}

function healthCheck(req, res) {
  res.json({ ok: true, dbState: Card.db.readyState });
}

export { listCards, listCardsByDeck, uploadCards, patchCard, removeCard, healthCheck };
