
import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'decentralized-ai-farming';

let client: MongoClient;
let db: Db;

export async function connectToDatabase() {
  if (db) {
    return { db };
  }

  client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db(DB_NAME);

  return { db };
}

export async function disconnectFromDatabase() {
  if (client) {
    await client.close();
  }
}
