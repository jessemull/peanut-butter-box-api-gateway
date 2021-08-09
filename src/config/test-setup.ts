process.env.OKTA_DOMAIN = 'https://dev-82492334.okta.com'

jest.mock('../lib/logger', () => ({
  info: jest.fn(),
  error: jest.fn()
}))
