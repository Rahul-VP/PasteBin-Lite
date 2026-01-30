import React, { useMemo, useState } from 'react';
import { apiFetch } from '../api/client.js';

export default function CreatePaste() {
  const [content, setContent] = useState('');
  const [ttlSeconds, setTtlSeconds] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const payload = useMemo(() => {
    const body = { content };
    if (ttlSeconds !== '') body.ttl_seconds = ttlSeconds;
    if (maxViews !== '') body.max_views = maxViews;
    return body;
  }, [content, ttlSeconds, maxViews]);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setSubmitting(true);

    try {
      const data = await apiFetch('/pastes', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setResult(data);
    } catch (err) {
      const details = err?.details ? ` (${JSON.stringify(err.details)})` : '';
      setError(`${err.message}${details}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card">
      <form onSubmit={onSubmit}>
        <label>Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste text here..."
        />

        <div className="row">
          <div>
            <label>TTL (seconds, optional)</label>
            <input
              value={ttlSeconds}
              onChange={(e) => setTtlSeconds(e.target.value)}
              inputMode="numeric"
              placeholder="e.g. 60"
            />
          </div>
          <div>
            <label>Max views (optional)</label>
            <input
              value={maxViews}
              onChange={(e) => setMaxViews(e.target.value)}
              inputMode="numeric"
              placeholder="e.g. 5"
            />
          </div>
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create paste'}
        </button>

        {error && <div className="error">{error}</div>}
        {result?.url && (
          <div className="success">
            Shareable link:{' '}
            <a href={result.url} target="_blank" rel="noreferrer">
               {window.location.origin}/p/{result.id}
            </a>
          </div>
        )}
      </form>
    </div>
  );
}
