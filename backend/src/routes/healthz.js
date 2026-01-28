const express = require('express');
const { getDb } = require('../db');

const router = express.Router();

router.get('/healthz', async (req, res) => {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false });
  }
});

module.exports = router;
