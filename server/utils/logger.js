function log(level, payload) {
  const entry = {
    level,
    timestamp: new Date().toISOString(),
    ...payload,
  };
  console.log(JSON.stringify(entry));
}

function logInfo(payload) {
  log('info', payload);
}

function logWarn(payload) {
  log('warn', payload);
}

function logError(payload) {
  log('error', payload);
}

function logAudit(action, payload = {}) {
  log('info', { event: `audit.${action}`, ...payload });
}

export { logInfo, logWarn, logError, logAudit };
