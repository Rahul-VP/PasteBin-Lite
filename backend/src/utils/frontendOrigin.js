function normalizeOrigin(origin) {
  if (!origin) return null;
  const trimmed = String(origin).trim().replace(/\/$/, '');
  if (!trimmed) return null;
  return trimmed;
}

function getFrontendOrigin(req) {
  const fromEnv = normalizeOrigin(process.env.FRONTEND_ORIGIN);
  if (fromEnv) return fromEnv;

  const fromHeader = normalizeOrigin(req.get('origin'));
  if (fromHeader) return fromHeader;

  return null;
}

module.exports = {
  getFrontendOrigin
};
