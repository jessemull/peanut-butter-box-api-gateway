import { getSecret } from './secrets-manager'
import client from './secrets-client'

jest.mock('./secrets-client')

describe('secrets manager', () => {
  it('should cache and return secrets', async () => {
    const promise = jest.fn().mockReturnValueOnce(Promise.resolve({ SecretString: '{ "secretId": "secret" }' }))
    client.getSecretValue = jest.fn().mockImplementation(() => ({ promise }))
    const secret = await getSecret('secretId')
    await getSecret('secretId')
    expect(secret).toEqual('secret')
  })
  it('should return undefined if no secret exists', async () => {
    const promise = jest.fn().mockReturnValueOnce(Promise.resolve({}))
    client.getSecretValue = jest.fn().mockImplementation(() => ({ promise }))
    const secret = await getSecret('invalidSecretId')
    expect(secret).toEqual(undefined)
  })
  it('should catch errors', async () => {
    client.getSecretValue = jest.fn().mockImplementation(() => {
      throw new Error()
    })
    const secret = await getSecret('invalidSecretId')
    expect(secret).toEqual(undefined)
  })
})
