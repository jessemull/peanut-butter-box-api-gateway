import OktaJwtVerifier, { Jwt } from '@okta/jwt-verifier'
import logger from '../../lib/logger'
import { AuthResponse, Event } from '../../types'

const oktaJwtVerifier = new OktaJwtVerifier({
  issuer: `${process.env.OKTA_DOMAIN as string}/oauth2/default`
})

const authorizer = (event: Event, context, callback: (error: any, response?: any) => void) => { // eslint-disable-line
  logger.info(event.toString())
  const bearerToken = event.authorizationToken.split(' ')
  if (bearerToken.length > 2 || bearerToken[0] !== 'Bearer') {
    logger.error(new Error('Invalid JWT'))
    callback(new Error('Unauthorized'))
  }
  oktaJwtVerifier.verifyAccessToken(bearerToken[1], process.env.OKTA_JWT_AUDIENCE as string)
    .then((jwt: Jwt) => {
      callback(null, generatePolicy('user', 'Allow', event.methodArn, jwt.claims.sub))
    })
    .catch(error => {
      logger.error(error)
      callback(new Error('Unauthorized'))
    })
}

const generatePolicy = (principalId: string, effect: string, resource: string, email: string): AuthResponse => ({
  context: {
    email
  },
  principalId,
  policyDocument: {
    Version: '2012-10-17',
    Statement: [{
      Action: 'execute-api:Invoke',
      Effect: effect,
      Resource: resource
    }]
  }
})

export default authorizer
