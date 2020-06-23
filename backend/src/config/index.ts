const { NODE_ENV } = process.env
const assertSet = (obj: any) =>
  Object.entries(obj).forEach(([key, val]) => {
    if (!val) {
      throw new Error(`Required environment variable ${key} is not set!`)
    }
  })

assertSet({ NODE_ENV })

if (NODE_ENV === 'development') {
  require('dotenv').config()
}

const { ARCHIVE_FILE_DIR, PORT, COOKIE_SECRET } = process.env
assertSet({ ARCHIVE_FILE_DIR, COOKIE_SECRET })

const DEFAULT_PORT = '9001'

export default {
  PORT: parseInt(PORT || DEFAULT_PORT, 10),
  ARCHIVE_FILE_DIR: ARCHIVE_FILE_DIR!,
  NODE_ENV: NODE_ENV!,
  COOKIE_SECRET: COOKIE_SECRET!
}
