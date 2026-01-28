function normalizeBaseUrl(baseUrl) {
  if (!baseUrl) return '';
  return String(baseUrl).trim().replace(/\/$/, '');
}

function joinUrl(base, path) {
  const b = normalizeBaseUrl(base);
  if (!b) return path;
  if (path.startsWith('/')) return `${b}${path}`;
  return `${b}/${path}`;
}

const API_BASE = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);

export async function apiFetch(path, options = {}) {
  const url = joinUrl(API_BASE, path);
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const message = data?.error?.message || 'Request failed';
    const details = data?.error?.details;
    const err = new Error(message);
    err.status = res.status;
    err.details = details;
    throw err;
  }

  return data;
}
