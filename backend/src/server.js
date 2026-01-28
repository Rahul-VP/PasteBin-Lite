require('dotenv').config();

const { createApp } = require('./app');
const { getClient } = require('./db');

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

async function main() {
  // Ensure DB connectivity at startup (fails fast)
  await getClient();

  const app = createApp();

  app.listen(PORT, () => {
    // Intentionally minimal log; production platforms capture stdout.
    console.log(`Backend listening on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
