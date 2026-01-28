const { MongoClient } = require('mongodb');

let clientPromise;

function getMongoUri() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is required');
  }
  return uri;
}

function getDbName() {
  return process.env.MONGODB_DB_NAME || 'pastebin_lite';
}

function getClient() {
  if (!clientPromise) {
    const client = new MongoClient(getMongoUri());
    clientPromise = client.connect();
  }
  return clientPromise;
}

async function getDb() {
  const client = await getClient();
  return client.db(getDbName());
}

async function getPastesCollection() {
  const db = await getDb();
  return db.collection('pastes');
}

module.exports = {
  getClient,
  getDb,
  getPastesCollection
};
