import { Router } from 'express';
import asyncHandler from '../middleware/async-handler.js';
import { getDecks, postDeck, removeDeck } from '../controllers/deck-controller.js';
import { listCardsByDeck } from '../controllers/card-controller.js';
import validateObjectId from '../middleware/validate-object-id.js';
import requireAuth from '../middleware/require-auth.js';

const router = Router();

router.get('/decks', asyncHandler(getDecks));
router.post('/decks', requireAuth, asyncHandler(postDeck));
router.get('/decks/:deckId/cards', validateObjectId('deckId'), asyncHandler(listCardsByDeck));
router.delete('/decks/:deckId', requireAuth, validateObjectId('deckId'), asyncHandler(removeDeck));

export default router;
