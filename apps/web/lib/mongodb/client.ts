// ============================================================
// MONGODB CLIENT — Connection singleton with pooling
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
    maxIdleTimeMS: 30000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 30000,
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

const mongoClient = { getClientPromise }
export default mongoClient
