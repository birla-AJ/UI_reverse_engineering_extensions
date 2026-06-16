function startTimer() {
  return performance.now();
}

function endTimer(start, label) {
  const end = performance.now();
  const time = Math.round(end - start);
  logInfo(label + " " + time + "ms");
  return time;
}
