import { Router } from 'express';
import upload from '../middleware/upload.js';
import asyncHandler from '../middleware/async-handler.js';
import { listCards, uploadCards, patchCard, removeCard } from '../controllers/card-controller.js';
import validateObjectId from '../middleware/validate-object-id.js';
import requireAuth from '../middleware/require-auth.js';

const router = Router();

router.get('/cards', asyncHandler(listCards));
router.post('/upload', requireAuth, upload.single('file'), asyncHandler(uploadCards));
router.patch('/cards/:cardId', requireAuth, validateObjectId('cardId'), asyncHandler(patchCard));
router.delete('/cards/:cardId', requireAuth, validateObjectId('cardId'), asyncHandler(removeCard));

export default router;
