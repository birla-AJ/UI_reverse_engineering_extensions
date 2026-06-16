function logInfo(message, data = null) {
  console.log("[UIRE]", message, data || "");
}

function logWarn(message, data = null) {
  console.warn("[UIRE]", message, data || "");
}

function logError(message, error = null) {
  console.error("[UIRE]", message, error || "");
}
