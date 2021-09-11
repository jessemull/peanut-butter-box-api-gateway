process.env.OKTA_DOMAIN = 'https://dev-82492334.okta.com'
process.env.GOOGLE_API_KEY_SECRET_NAME = 'GOOGLE_API_KEY_SECRET_NAME'
process.env.GOOGLE_API_URL = 'https://maps.googleapis.com'
process.env.USPS_ID_SECRET_NAME = 'USPS_ID'
process.env.USPS_URL = 'https://secure.shippingapis.com'

jest.mock('../lib/logger', () => ({
  info: jest.fn(),
  error: jest.fn()
}))
