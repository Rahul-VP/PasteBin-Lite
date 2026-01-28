function getNowMs(req) {
  const isTestMode = process.env.TEST_MODE === '1';
  if (!isTestMode) return Date.now();

  const headerVal = req.get('x-test-now-ms');
  if (!headerVal) return Date.now();

  const parsed = Number(headerVal);
  if (!Number.isFinite(parsed) || parsed < 0) return Date.now();
  return Math.floor(parsed);
}

module.exports = {
  getNowMs
};
