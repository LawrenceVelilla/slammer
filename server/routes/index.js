import { Router } from 'express';
import cardsRouter from './cards.js';
import decksRouter from './decks.js';
import healthRouter from './health.js';

const apiV1Router = Router();
apiV1Router.use('/health', healthRouter);
apiV1Router.use(cardsRouter);
apiV1Router.use(decksRouter);

const legacyRouter = Router();
legacyRouter.use('/health', healthRouter);
legacyRouter.use(cardsRouter);
legacyRouter.use(decksRouter);

export { apiV1Router, legacyRouter };
