function parsePagination(query, { defaultLimit = 100, maxLimit = 500 } = {}) {
  const pageInput = query.page;
  const limitInput = query.limit;

  const page = pageInput === undefined ? 1 : Number(pageInput);
  const limit = limitInput === undefined ? defaultLimit : Number(limitInput);

  if (!Number.isInteger(page) || page <= 0) {
    const error = new Error('page must be a positive integer');
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isInteger(limit) || limit <= 0 || limit > maxLimit) {
    const error = new Error(`limit must be an integer between 1 and ${maxLimit}`);
    error.statusCode = 400;
    throw error;
  }

  return { page, limit, skip: (page - 1) * limit };
}

function buildPaginationMeta({ total, page, limit }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export { parsePagination, buildPaginationMeta };
