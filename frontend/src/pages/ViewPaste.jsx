import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../api/client.js';

export default function ViewPaste() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError(null);
      setData(null);
      try {
        const res = await apiFetch(`/pastes/${id}`);
        if (!cancelled) setData(res);
      } catch (err) {
        if (!cancelled) setError(err.status === 404 ? 'Paste not found' : err.message);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <div className="card">
        <h2 style={{ marginTop: 0 }}>404</h2>
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card">
        <div>Loading…</div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Paste</h2>
      <pre>{data.content}</pre>
      <div style={{ marginTop: 12, opacity: 0.9 }}>
        <div>
          Remaining views:{' '}
          {data.remaining_views === null ? 'Unlimited' : String(data.remaining_views)}
        </div>
        <div>
          Expires at:{' '}
          {data.expires_at === null ? 'Never' : new Date(data.expires_at).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
