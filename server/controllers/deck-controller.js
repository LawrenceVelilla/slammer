import { createDeck, deleteDeckById, listDecks } from '../services/deck-service.js';
import { parsePagination } from '../utils/pagination.js';
import { parseOptionalSearch, parseSort } from '../utils/query.js';

async function getDecks(req, res) {
  const { page, limit } = parsePagination(req.query);
  const { sortBy, sortOrder } = parseSort(req.query, {
    defaultBy: 'createdAt',
    allowed: ['createdAt', 'updatedAt', 'name'],
  });
  const q = parseOptionalSearch(req.query);
  const result = await listDecks({ page, limit, q, sortBy, sortOrder });
  res.json({ total: result.decks.length, decks: result.decks, meta: result.meta });
}

async function postDeck(req, res) {
  const result = await createDeck(req.body, { requestId: req.requestId });
  const statusCode = result.created ? 201 : 200;
  res.status(statusCode).json(result);
}

async function removeDeck(req, res) {
  const { deckId } = req.params;
  const result = await deleteDeckById(deckId, { requestId: req.requestId });
  res.json(result);
}

export { getDecks, postDeck, removeDeck };
