import express from 'express';
import cors from 'cors';
import { apiV1Router, legacyRouter } from './routes/index.js';
import versionedResponse from './middleware/versioned-response.js';
import requestLogger from './middleware/request-logger.js';
import rateLimit from './middleware/rate-limit.js';
import { logError } from './utils/logger.js';

function createApp() {
  const app = express();

  app.use(cors());
  app.use(requestLogger);
  app.use(rateLimit());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  app.use('/api/v1', versionedResponse('v1'), apiV1Router);
  app.use(legacyRouter);

  app.use((err, req, res, next) => {
    logError({
      event: 'request.error',
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      message: err.message,
    });
    if (err.type === 'entity.too.large') {
      return res.status(413).json({ error: 'Payload too large' });
    }
    if (err.name === 'MulterError' && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Uploaded file exceeds size limit' });
    }
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ error: err.message || 'Internal Server Error' });
  });

  return app;
}

export default createApp;
