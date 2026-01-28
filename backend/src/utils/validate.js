function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function parseOptionalPositiveInt(value) {
  if (value === undefined || value === null || value === '') return null;

  // Accept numbers or numeric strings; enforce integer >= 1.
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(n) || n < 1) return { error: 'must be an integer >= 1' };
  return n;
}

function validateCreatePasteBody(body) {
  const errors = {};

  if (!body || typeof body !== 'object') {
    return { ok: false, status: 400, error: 'Request body must be JSON object' };
  }

  if (!isNonEmptyString(body.content)) {
    errors.content = 'content is required and must be a non-empty string';
  }

  const ttl = parseOptionalPositiveInt(body.ttl_seconds);
  if (ttl && ttl.error) {
    errors.ttl_seconds = 'ttl_seconds must be an integer >= 1';
  }

  const mv = parseOptionalPositiveInt(body.max_views);
  if (mv && mv.error) {
    errors.max_views = 'max_views must be an integer >= 1';
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, status: 400, error: 'Invalid input', details: errors };
  }

  return {
    ok: true,
    value: {
      content: body.content,
      ttl_seconds: ttl === null ? null : ttl,
      max_views: mv === null ? null : mv
    }
  };
}

module.exports = {
  validateCreatePasteBody
};
