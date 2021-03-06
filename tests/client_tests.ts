import {
  clearAllIndexes,
  config,
  PUBLIC_KEY,
  MeiliSearch,
  MASTER_KEY,
  PRIVATE_KEY,
  BAD_HOST,
} from './meilisearch-test-utils'

afterAll(() => {
  return clearAllIndexes(config)
})

test(`Master key: Should get keys`, async () => {
  const client = new MeiliSearch({
    ...config,
    apiKey: MASTER_KEY,
  })
  const keys = await client.getKeys()
  expect(keys).toHaveProperty(
    'private',
    '8dcbb482663333d0280fa9fedf0e0c16d52185cb67db494ce4cd34da32ce2092'
  )
  expect(keys).toHaveProperty(
    'public',
    '3b3bf839485f90453acc6159ba18fbed673ca88523093def11a9b4f4320e44a5'
  )
})

describe.each([
  { key: MASTER_KEY, permission: 'Master' },
  { key: PRIVATE_KEY, permission: 'Private' },
  { key: PUBLIC_KEY, permission: 'Public' },
])('Test on client', ({ key, permission }) => {
  test(`${permission} key: Create client with api key`, async () => {
    const client = new MeiliSearch({
      ...config,
      apiKey: key,
    })
    const health = await client.isHealthy()
    expect(health).toBe(true)
  })

  test(`${permission} key: Create client with custom headers`, async () => {
    const client = new MeiliSearch({
      ...config,
      apiKey: key,
      headers: {
        Expect: '200-OK',
      },
    })
    expect(client.config.headers).toStrictEqual({ Expect: '200-OK' })
    const health = await client.isHealthy()
    expect(health).toBe(true)
  })

  test(`${permission} key: No double slash when on host with domain and path and trailing slash`, async () => {
    try {
      const customHost = `${BAD_HOST}/api/`
      const client = new MeiliSearch({
        host: customHost,
        apiKey: key,
      })
      const health = await client.isHealthy()
      expect(health).toBe(false) // Left here to trigger failed test if error is not thrown
    } catch (e) {
      expect(e.message).toMatch(`${BAD_HOST}/api/health`)
      expect(e.type).toBe('MeiliSearchCommunicationError')
    }
  })

  test(`${permission} key: No double slash when on host with domain and path and no trailing slash`, async () => {
    try {
      const customHost = `${BAD_HOST}/api`
      const client = new MeiliSearch({
        host: customHost,
        apiKey: key,
      })
      const health = await client.isHealthy()
      expect(health).toBe(false) // Left here to trigger failed test if error is not thrown
    } catch (e) {
      expect(e.message).toMatch(`${BAD_HOST}/api/health`)
      expect(e.type).toBe('MeiliSearchCommunicationError')
    }
  })

  test(`${permission} key: host with double slash should keep double slash`, async () => {
    try {
      const customHost = `${BAD_HOST}//`
      const client = new MeiliSearch({
        host: customHost,
        apiKey: key,
      })
      const health = await client.isHealthy()
      expect(health).toBe(false) // Left here to trigger failed test if error is not thrown
    } catch (e) {
      expect(e.message).toMatch(`${BAD_HOST}//health`)
      expect(e.type).toBe('MeiliSearchCommunicationError')
    }
  })

  test(`${permission} key: host with one slash should not double slash`, async () => {
    try {
      const customHost = `${BAD_HOST}/`
      const client = new MeiliSearch({
        host: customHost,
        apiKey: key,
      })
      const health = await client.isHealthy()
      expect(health).toBe(false) // Left here to trigger failed test if error is not thrown
    } catch (e) {
      expect(e.message).toMatch(`${BAD_HOST}/health`)
      expect(e.type).toBe('MeiliSearchCommunicationError')
    }
  })
})

describe.each([
  { key: MASTER_KEY, permission: 'Master' },
  { key: PRIVATE_KEY, permission: 'Private' },
])('Test on client', ({ key, permission }) => {
  beforeEach(async () => {
    await clearAllIndexes(config)
  })
  test(`${permission} key: Create client with custom headers`, async () => {
    const client = new MeiliSearch({
      ...config,
      apiKey: key,
      headers: {
        Expect: '200-OK',
      },
    })
    expect(client.config.headers).toStrictEqual({ Expect: '200-OK' })
    const health = await client.isHealthy()
    expect(health).toBe(true)
    await client.getOrCreateIndex('test')
    const indexes = await client.listIndexes()
    expect(indexes.length).toBe(1)
  })
})
