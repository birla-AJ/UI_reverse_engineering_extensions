function safeExecute(fn, name) {
  try {
    return fn();
  } catch (error) {
    logError(name, error);
    return null;
  }
}

async function safeExecuteAsync(fn, name) {
  try {
    return await fn();
  } catch (error) {
    logError(name, error);
    return null;
  }
}
