
import { Router } from 'express';
import asyncHandler from '../middleware/async-handler.js';
import { assessPunishment, createPunishment, echoDestroy, gradeAnswer } from '../controllers/chat-controller.js';

const router = Router();

router.post('/chat/grade', asyncHandler(gradeAnswer));
router.post('/chat/punishment', asyncHandler(createPunishment));
router.post('/chat/punishment/assess', asyncHandler(assessPunishment));
router.post('/chat/destroy', echoDestroy);

export default router;
