import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { mkdirSync } from 'fs'
import { join } from 'path'

type DrizzleDb = ReturnType<typeof drizzle>

let _db: DrizzleDb | null = null

export interface DatabaseConfig {
  dataPath: string
}

export function initDatabase(config: DatabaseConfig): { sqlite: Database.Database; db: DrizzleDb } {
  const dbPath = join(config.dataPath, 'database.sqlite')
  mkdirSync(config.dataPath, { recursive: true })

  const sqlite = new Database(dbPath)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  const db = drizzle({ client: sqlite })
  _db = db

  return { sqlite, db }
}

// Get the initialized db instance
export function getDb(): DrizzleDb {
  if (!_db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return _db
}

// Convenience export for query modules - initialized by main process
// Using a proxy pattern to allow dynamic access to db operations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = {} as Record<string, any>