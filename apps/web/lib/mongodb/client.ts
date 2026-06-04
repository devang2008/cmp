// ============================================================
// MONGODB CLIENT — Optimized connection singleton with pooling
// ============================================================
import { MongoClient, type Db, type Collection, type Document } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || ''
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'cybersec_marketplace'

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

let clientPromise: Promise<MongoClient> | null = null

function getClientPromise(): Promise<MongoClient> {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set')
  }
  if (clientPromise) return clientPromise

  const options = {
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 60000,          // Keep idle connections alive 60s (was 30s)
    connectTimeoutMS: 5000,        // Fail fast on connect (was 10s)
    socketTimeoutMS: 15000,        // Fail fast on socket (was 30s)
    serverSelectionTimeoutMS: 5000, // Don't wait long for server selection
    compressors: ['zstd', 'snappy', 'zlib'] as any, // Compress payloads over the wire
  }

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(MONGODB_URI, options)
      global._mongoClientPromise = client.connect()
    }
    clientPromise = global._mongoClientPromise
  } else {
    const client = new MongoClient(MONGODB_URI, options)
    clientPromise = client.connect()
  }
  return clientPromise
}

export async function getMongoDb(): Promise<Db> {
  const client = await getClientPromise()
  return client.db(MONGODB_DB_NAME)
}

export async function getCollection<T extends Document>(
  name: string
): Promise<Collection<T>> {
  const db = await getMongoDb()
  return db.collection<T>(name)
}

// Pre-warm the connection on module load (non-blocking)
if (MONGODB_URI) {
  getClientPromise().catch(() => {
    // Silently fail — connection will retry on first real request
  })
}

const mongoClient = { getClientPromise }
export default mongoClient
