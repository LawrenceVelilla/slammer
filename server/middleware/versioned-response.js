function versionedResponse(version) {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = (payload) => {
      if (payload && payload.apiVersion) {
        return originalJson(payload);
      }

      if (res.statusCode >= 400) {
        return originalJson({
          apiVersion: version,
          error: payload?.error || 'Request failed',
        });
      }

      return originalJson({
        apiVersion: version,
        data: payload,
      });
    };

    return next();
  };
}

export default versionedResponse;
