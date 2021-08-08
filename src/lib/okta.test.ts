import getOktaClient from './okta'

jest.mock('./secrets-manager', () => ({
  getSecret: jest.fn(() => 'token')
}))

describe('okta client', () => {
  it('should be initialized with api token', async () => {
    let client = await getOktaClient()
    expect(client).toBeDefined()
    client = await getOktaClient()
    expect(client).toBeDefined()
  })
})
