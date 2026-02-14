const buckets = new Map();

function rateLimit({
  windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  max = Number(process.env.RATE_LIMIT_MAX) || 120,
} = {}) {
  return (req, res, next) => {
    const key = `${req.ip}:${req.method}:${req.baseUrl || ''}:${req.path}`;
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || now > bucket.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    bucket.count += 1;

    if (bucket.count > max) {
      res.setHeader('Retry-After', Math.ceil((bucket.resetAt - now) / 1000));
      return res.status(429).json({ error: 'Too many requests' });
    }

    return next();
  };
}

export default rateLimit;
