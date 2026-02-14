import { randomUUID } from 'crypto';
import { logInfo } from '../utils/logger.js';

function requestLogger(req, res, next) {
  const requestId = req.headers['x-request-id'] || randomUUID();
  const start = Date.now();

  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  logInfo({
    event: 'request.start',
    requestId,
    method: req.method,
    path: req.originalUrl,
  });

  res.on('finish', () => {
    logInfo({
      event: 'request.end',
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - start,
    });
  });

  next();
}

export default requestLogger;
