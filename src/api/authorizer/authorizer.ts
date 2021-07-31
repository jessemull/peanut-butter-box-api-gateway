import OktaJwtVerifier from '@okta/jwt-verifier'
import logger from '../lib/logger'

interface Event {
  authorizationToken: string;
  methodArn: string;
}

interface Statement {
  Action: string;
  Effect: string;
  Resource: string;
}

interface AuthResponse {
  context: {
    claims: any; // eslint-disable-line
  };
  principalId: string;
  policyDocument?:{
    Version: string;
    Statement: Array<Statement>;
  }
}

const oktaJwtVerifier = new OktaJwtVerifier({
  issuer: 'https://dev-82492334.okta.com/oauth2/default'
})

const authorizer = (event: Event, context, callback: (error: any, response?: any) => void) => { // eslint-disable-line
  logger.info(event.toString())
  const bearerToken = event.authorizationToken.split(' ')
  if (bearerToken.length > 2 || bearerToken[0] !== 'Bearer') {
    logger.error(new Error('Invalid JWT'))
    callback(new Error('Unauthorized'))
  }
  oktaJwtVerifier.verifyAccessToken(bearerToken[1], 'api://default')
    .then(jwt => {
      callback(null, generatePolicy('user', 'Allow', event.methodArn, jwt.claims))
    })
    .catch(error => {
      logger.error(error)
      callback(new Error('Unauthorized'))
    })
}

const generatePolicy = (principalId: string, effect: string, resource: string, claims: any): AuthResponse => ({ // eslint-disable-line
  context: {
    claims, // eslint-disable-line
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
