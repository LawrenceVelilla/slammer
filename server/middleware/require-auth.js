function requireAuth(req, res, next) {
  const configuredKey = process.env.LOCAL_API_KEY || 'dev-local-key';
  const headerKey = req.headers['x-api-key'];
  const bearer = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;

  const providedKey = headerKey || bearer;

  if (!providedKey || providedKey !== configuredKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return next();
}

export default requireAuth;
