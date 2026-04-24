// ============================================================
// ATLAS APP SERVICES — Data API HTTP Wrapper
// ============================================================
//
// This replaces the deprecated `realm` npm package with a thin
// HTTP wrapper around MongoDB Atlas Data API endpoints.
//
// ============================================================
// MANUAL CONFIGURATION REQUIRED IN ATLAS UI:
// ============================================================
//
// 1. COLLECTION ACCESS RULES (configure in Atlas App Services > Rules):
//
//    vendor_profiles:
//      READ: any authenticated user (anonymous data)
//      WRITE: only document owner (alias matches caller's alias)
//      Rule: { "%%user.custom_data.alias": "%%root.alias" }
//
//    buyer_requirements:
//      READ: any authenticated user (marketplace browsing)
//      WRITE: only document owner
//      Filter on READ: if status = "closed", hide from listing
//
//    proposals:
//      READ: caller's alias = vendor_alias OR buyer_alias
//      WRITE: caller's alias = vendor_alias (create/edit)
//      DELETE: vendor can update status to "withdrawn" only
//
// 2. TRIGGERS (configure in Atlas App Services > Triggers):
//
//    Trigger 1: On insert into proposals
//      → Update buyer_requirements.matched_vendor_aliases
//
//    Trigger 2: On update of proposals where status="accepted"
//      → Create deal in Supabase via HTTP webhook to Next.js API
//
//    Trigger 3: On insert into vendor_profiles
//      → Sync alias to Supabase alias_directory
//
// Documentation: https://www.mongodb.com/docs/atlas/app-services/data-api/
// ============================================================

interface DataAPIConfig {
  appId: string
  apiKey: string
  baseUrl: string
  dataSource: string
  database: string
}

function getConfig(): DataAPIConfig {
  const appId = process.env.NEXT_PUBLIC_ATLAS_APP_ID
  const apiKey = process.env.MONGODB_DATA_API_KEY

  if (!appId || !apiKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_ATLAS_APP_ID or MONGODB_DATA_API_KEY in environment'
    )
  }

  return {
    appId,
    apiKey,
    baseUrl: `https://data.mongodb-api.com/app/${appId}/endpoint/data/v1`,
    dataSource: process.env.MONGODB_DATA_SOURCE || 'Cluster0',
    database: process.env.MONGODB_DB_NAME || 'cybersec_marketplace',
  }
}

async function dataApiRequest<T>(
  action: string,
  body: Record<string, unknown>
): Promise<T> {
  const config = getConfig()

  const response = await fetch(`${config.baseUrl}/action/${action}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.apiKey,
    },
    body: JSON.stringify({
      dataSource: config.dataSource,
      database: config.database,
      ...body,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Atlas Data API error (${response.status}): ${errorText}`
    )
  }

  return response.json() as Promise<T>
}

/**
 * Find documents in a collection using the Atlas Data API.
 */
export async function findDocuments<T>(
  collection: string,
  filter: Record<string, unknown> = {},
  options: {
    sort?: Record<string, 1 | -1>
    limit?: number
    projection?: Record<string, 0 | 1>
    database?: string
  } = {}
): Promise<T[]> {
  const body: Record<string, unknown> = { collection, filter }
  if (options.sort) body.sort = options.sort
  if (options.limit) body.limit = options.limit
  if (options.projection) body.projection = options.projection
  if (options.database) body.database = options.database

  const result = await dataApiRequest<{ documents: T[] }>('find', body)
  return result.documents
}

/**
 * Insert a single document into a collection.
 */
export async function insertDocument<T extends Record<string, unknown>>(
  collection: string,
  document: T,
  database?: string
): Promise<{ insertedId: string }> {
  const body: Record<string, unknown> = { collection, document }
  if (database) body.database = database

  return dataApiRequest<{ insertedId: string }>('insertOne', body)
}

/**
 * Update a single document matching the filter.
 */
export async function updateDocument(
  collection: string,
  filter: Record<string, unknown>,
  update: Record<string, unknown>,
  database?: string
): Promise<{ matchedCount: number; modifiedCount: number }> {
  const body: Record<string, unknown> = { collection, filter, update }
  if (database) body.database = database

  return dataApiRequest<{ matchedCount: number; modifiedCount: number }>(
    'updateOne',
    body
  )
}

/**
 * Delete a single document matching the filter.
 */
export async function deleteDocument(
  collection: string,
  filter: Record<string, unknown>,
  database?: string
): Promise<{ deletedCount: number }> {
  const body: Record<string, unknown> = { collection, filter }
  if (database) body.database = database

  return dataApiRequest<{ deletedCount: number }>('deleteOne', body)
}

/**
 * Find a single document in a collection.
 */
export async function findOneDocument<T>(
  collection: string,
  filter: Record<string, unknown>,
  database?: string
): Promise<T | null> {
  const body: Record<string, unknown> = { collection, filter }
  if (database) body.database = database

  const result = await dataApiRequest<{ document: T | null }>(
    'findOne',
    body
  )
  return result.document
}
