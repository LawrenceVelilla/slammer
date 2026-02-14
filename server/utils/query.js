function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseSort(query, { defaultBy = 'createdAt', allowed = [] } = {}) {
  const sortBy = query.sortBy || defaultBy;
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

  if (!allowed.includes(sortBy)) {
    const error = new Error(`sortBy must be one of: ${allowed.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  return { sortBy, sortOrder };
}

function parseOptionalSearch(query) {
  if (!query.q) return null;
  const q = String(query.q).trim();
  if (!q) return null;
  if (q.length > 200) {
    const error = new Error('q must be 200 characters or fewer');
    error.statusCode = 400;
    throw error;
  }
  return q;
}

export { escapeRegex, parseSort, parseOptionalSearch };
