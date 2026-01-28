const express = require('express');
const { ObjectId } = require('mongodb');
const { getPastesCollection } = require('../db');
const { getNowMs } = require('../utils/time');
const { validateCreatePasteBody } = require('../utils/validate');
const { jsonError } = require('../utils/httpErrors');
const { getFrontendOrigin } = require('../utils/frontendOrigin');

const router = express.Router();

router.post('/pastes', async (req, res) => {
  const validated = validateCreatePasteBody(req.body);
  if (!validated.ok) {
    return jsonError(res, validated.status || 400, validated.error || 'Invalid input', validated.details);
  }

  const { content, ttl_seconds, max_views } = validated.value;
  const nowMs = getNowMs(req);
  const createdAt = new Date(nowMs);
  const expiresAt = ttl_seconds ? new Date(nowMs + ttl_seconds * 1000) : null;

  const frontendOrigin = getFrontendOrigin(req);
  if (!frontendOrigin) {
    return jsonError(
      res,
      500,
      'FRONTEND_ORIGIN is not configured (or Origin header missing); cannot construct shareable URL'
    );
  }

  try {
    const pastes = await getPastesCollection();
    const insertRes = await pastes.insertOne({
      content,
      created_at: createdAt,
      expires_at: expiresAt,
      max_views: max_views ?? null,
      views_used: 0
    });

    const id = String(insertRes.insertedId);
    const url = `${frontendOrigin}/p/${id}`;

    return res.status(201).json({ id, url });
  } catch (err) {
    return jsonError(res, 500, 'Internal Server Error');
  }
});

router.get('/pastes/:id', async (req, res) => {
  let oid;
  try {
    oid = new ObjectId(req.params.id);
  } catch {
    return jsonError(res, 404, 'Not found');
  }

  const nowMs = getNowMs(req);
  const now = new Date(nowMs);

  try {
    const pastes = await getPastesCollection();

    const filter = {
      _id: oid,
      $and: [
        { $or: [{ expires_at: null }, { expires_at: { $gt: now } }] },
        {
          $or: [
            { max_views: null },
            { $expr: { $lt: ['$views_used', '$max_views'] } }
          ]
        }
      ]
    };

    const update = { $inc: { views_used: 1 } };

    const result = await pastes.findOneAndUpdate(filter, update, {
      returnDocument: 'after',
      projection: { content: 1, expires_at: 1, max_views: 1, views_used: 1 }
    });

    if (!result || !result.value) {
      return jsonError(res, 404, 'Not found');
    }

    const doc = result.value;
    const maxViews = doc.max_views === undefined ? null : doc.max_views;
    const remainingViews = maxViews === null ? null : Math.max(0, maxViews - doc.views_used);

    return res.status(200).json({
      content: doc.content,
      remaining_views: remainingViews,
      expires_at: doc.expires_at ? new Date(doc.expires_at).toISOString() : null
    });
  } catch (err) {
    return jsonError(res, 500, 'Internal Server Error');
  }
});

module.exports = router;
