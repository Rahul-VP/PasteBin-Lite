const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const healthzRouter = require('./routes/healthz');
const pastesRouter = require('./routes/pastes');
const { jsonError } = require('./utils/httpErrors');

function createApp() {
  const app = express();

  app.disable('x-powered-by');

  app.use(helmet({
    contentSecurityPolicy: false
  }));

  app.use(morgan('combined'));

  app.use(express.json({ limit: '1mb' }));

  const allowedOrigin = process.env.FRONTEND_ORIGIN
    ? String(process.env.FRONTEND_ORIGIN).trim().replace(/\/$/, '')
    : null;
  app.use(
    cors({
      origin: (origin, cb) => {
        // Allow non-browser tools (no Origin header) and allow configured frontend origin.
        if (!origin) return cb(null, true);
        if (!allowedOrigin) return cb(null, true);
        if (origin === allowedOrigin) return cb(null, true);
        return cb(null, false);
      }
    })
  );

  app.use('/api', healthzRouter);
  app.use('/api', pastesRouter);

  app.use('/api', (req, res) => jsonError(res, 404, 'Not found'));

  // Generic error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err && err instanceof SyntaxError && 'body' in err) {
      return jsonError(res, 400, 'Invalid JSON');
    }
    return jsonError(res, 500, 'Internal Server Error');
  });

  return app;
}

module.exports = {
  createApp
};
