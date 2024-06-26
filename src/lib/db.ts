import { Pool } from 'pg'
import config from '@lib/config'

export const testConnection = async () => {
  await dbPool.query('SELECT NOW()')
}

let dbPool: Pool

if (process.env.NODE_ENV === 'production') {
  dbPool = new Pool({
    connectionString: config.PG_CONNECTION_STRING
  })
} else {
  if (!global.dbPool) {
    global.dbPool = new Pool({
      connectionString: config.PG_CONNECTION_STRING
    })
  }
  dbPool = global.dbPool
}

export { dbPool }
