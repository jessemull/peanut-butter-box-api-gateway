import OktaJwtVerifier, { Jwt } from '@okta/jwt-verifier'
import authorizer from './authorizer'

describe('authorizer', () => {
  it('should validate JWT and return policy', async () => {
    OktaJwtVerifier.prototype.verifyAccessToken = async () => Promise.resolve({ claims: { sub: 'first.last@domain.com' } } as Jwt)
    const event = {
      authorizationToken: 'Bearer token',
      methodArn: 'methodArn'
    }
    const policy = {
      context: {
        claims: {
          sub: 'first.last@domain.com'
        }
      },
      policyDocument: {
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: 'methodArn'
          }
        ],
        Version: '2012-10-17'
      },
      principalId: 'user'
    }
    const data = await authorizer(event as any)
    expect(data).toEqual(policy)
  })
  it('should catch errors', async () => {
    OktaJwtVerifier.prototype.verifyAccessToken = async () => Promise.reject(new Error())
    const event = {
      authorizationToken: 'Bearer token',
      methodArn: 'methodArn'
    }
    const error = await authorizer(event as any)
    expect(error).toEqual(new Error('Unauthorized'))
  })
  it('should catch malformed bearer token', async () => {
    const event = {
      authorizationToken: 'InvalidBearer token',
      methodArn: 'methodArn'
    }
    const error = await authorizer(event as any)
    expect(error).toEqual(new Error('Unauthorized'))
  })
})
