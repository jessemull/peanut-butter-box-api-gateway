import { SecretsManager } from 'aws-sdk'
import { getSecret } from './secrets-manager'

jest.mock('aws-sdk', () => {
  class SecretsManager {
    getSecretValue ({ SecretId }) {
      return { promise: jest.fn().mockReturnValueOnce(Promise.resolve(SecretId === 'secretId' ? { SecretString: '{ "secretId": "secret" }' } : {})) }
    }
  }
  return {
    SecretsManager
  }
})

describe('secrets manager', () => {
  it('should cache and return secrets', async () => {
    const secret = await getSecret('secretId')
    await getSecret('secretId')
    expect(secret).toEqual('secret')
  })
  it('should return undefined if no secret exists', async () => {
    const secret = await getSecret('invalidSecretId')
    expect(secret).toEqual(undefined)
  })
})
