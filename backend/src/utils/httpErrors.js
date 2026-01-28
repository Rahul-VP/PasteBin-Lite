function jsonError(res, status, message, details) {
  const payload = { error: { message } };
  if (details) payload.error.details = details;
  return res.status(status).json(payload);
}

module.exports = {
  jsonError
};
