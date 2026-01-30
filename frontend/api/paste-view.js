const React = require('react');
const ReactDOMServer = require('react-dom/server');

function escapeForTitle(text) {
  return String(text || '').slice(0, 120);
}

function HtmlShell({ title, children }) {
  return React.createElement(
    'html',
    { lang: 'en' },
    React.createElement(
      'head',
      null,
      React.createElement('meta', { charSet: 'UTF-8' }),
      React.createElement('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }),
      React.createElement('title', null, title)
    ),
    React.createElement(
      'body',
      {
        style: {
          margin: 0,
          fontFamily: 'system-ui,Segoe UI,Roboto,Arial,sans-serif',
          background: '#0b0f19',
          color: '#e6e8ee'
        }
      },
      React.createElement(
        'div',
        { style: { maxWidth: 900, margin: '0 auto', padding: 24 } },
        React.createElement(
          'div',
          { style: { background: '#121a2a', border: '1px solid #22304f', borderRadius: 12, padding: 16 } },
          children
        )
      )
    )
  );
}

function PasteView({ content }) {
  return React.createElement(
    React.Fragment,
    null,
    React.createElement('h1', { style: { marginTop: 0, fontSize: 22 } }, 'Paste'),
    React.createElement('pre', { style: { whiteSpace: 'pre-wrap', wordBreak: 'break-word' } }, content)
  );
}

function NotFound() {
  return React.createElement(
    React.Fragment,
    null,
    React.createElement('h1', { style: { marginTop: 0, fontSize: 22 } }, '404'),
    React.createElement('div', null, 'Paste not found')
  );
}

function normalizeBaseUrl(base) {
  if (!base) return null;
  return String(base).trim().replace(/\/$/, '');
}

module.exports = async (req, res) => {
  const id = req.query.id;
  if (!id || typeof id !== 'string') {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(HtmlShell, { title: '404 - Pastebin-Lite' }, React.createElement(NotFound))
    );
    return res.end(`<!doctype html>${html}`);
  }

  const apiBase =
    normalizeBaseUrl(process.env.API_BASE_URL) || normalizeBaseUrl(process.env.VITE_API_BASE_URL);
  if (!apiBase) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end('API_BASE_URL is not configured');
  }

  try {
    const testNowHeader = req.headers['x-test-now-ms'];
    const apiRes = await fetch(`${apiBase}/api/pastes/${encodeURIComponent(id)}`, {
      headers: {
        Accept: 'application/json',
        ...(testNowHeader ? { 'x-test-now-ms': String(testNowHeader) } : {})
      }
    });

    if (apiRes.status === 404) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(HtmlShell, { title: '404 - Pastebin-Lite' }, React.createElement(NotFound))
      );
      return res.end(`<!doctype html>${html}`);
    }

    if (!apiRes.ok) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.end('Upstream error');
    }

    const data = await apiRes.json();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    const title = `Paste - ${escapeForTitle(id)}`;
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(HtmlShell, { title }, React.createElement(PasteView, { content: data.content }))
    );
    return res.end(`<!doctype html>${html}`);
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end('Internal error');
  }
};
