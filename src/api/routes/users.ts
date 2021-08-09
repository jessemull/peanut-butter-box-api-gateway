import get from 'lodash.get'
import { Router, Request, Response } from 'express'
import dynamoDb from '../../lib/dynamo'
import ses from '../../lib/ses-client'
import getOktaClient from '../../lib/okta'
import logger from '../../lib/logger'
import hashPassword from '../../lib/hash'
import { Activation, AuthnResponse, PasswordResetResponse, Reset, User } from '../../types'
import { AppUser } from '@okta/okta-sdk-nodejs'

const USERS_TABLE = process.env.USERS_TABLE || 'users-table-dev'
const route: Router = Router()

export default (app: Router): void => {
  app.use('/users', route)

  route.get('/', async (req: Request, res: Response): Promise<void | Response> => {
    try {
      // Retrieve e-mail from event context via authorizer JWT

      const email = get(req, 'event.requestContext.authorizer.claims.sub', '') as string // eslint-disable-line

      // Bad JWT

      if (!email) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      // Get the dynamo user

      const params = {
        TableName: USERS_TABLE,
        Key: {
          email
        }
      }

      const data = await dynamoDb.get(params).promise()

      // Check if user is found and return user details

      if (data.Item) {
        const { id, email, firstName, lastName, login } = data.Item as User
        res.json({ id, email, firstName, lastName, login })
      } else {
        res.status(404).json({ error: 'User not found' })
      }
    } catch (error) {
      logger.error(error)
      res.status(500).json({ error: 'Could not fetch user' })
    }
  })

  route.post('/verify', async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { activationToken, password } = req.body as Activation
      const oktaClient = await getOktaClient()

      // Swap activation token for state token

      const url = `${process.env.OKTA_DOMAIN as string}/api/v1/authn`
      const request = {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: activationToken
        })
      }

      const activationData = await oktaClient.http.http(url, request)
      const activationResponse = await activationData.json() as AuthnResponse

      const urlPasswordReset = `${process.env.OKTA_DOMAIN as string}/api/v1/authn/credentials/reset_password`
      const requestPasswordReset = {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newPassword: password,
          stateToken: activationResponse.stateToken
        })
      }

      const passwordData = await oktaClient.http.http(urlPasswordReset, requestPasswordReset)
      const passwordResponse = await passwordData.json() as PasswordResetResponse
      const hashedPassword = await hashPassword(password)

      const params = {
        TableName: USERS_TABLE,
        Key: {
          email: passwordResponse._embedded.user.profile.login
        },
        UpdateExpression: 'set password = :p, #st = :s',
        ExpressionAttributeValues: {
          ':p': hashedPassword,
          ':s': 'ACTIVE'
        },
        ExpressionAttributeNames: {
          '#st': 'status'
        },
        ReturnValues: 'ALL_OLD'
      }
      await dynamoDb.update(params).promise()

      res.json(passwordResponse)
    } catch (error) {
      logger.error(error)
      res.status(500).json({ error: 'Could not verify user' })
    }
  })

  route.post('/reset', async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { resetToken, password } = req.body as Reset
      const oktaClient = await getOktaClient()

      // Swap reset token for state token

      const url = `${process.env.OKTA_DOMAIN as string}/api/v1/authn`
      const request = {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: resetToken
        })
      }

      const resetData = await oktaClient.http.http(url, request)
      const resetResponse = await resetData.json() as AuthnResponse

      const urlPasswordReset = `${process.env.OKTA_DOMAIN as string}/api/v1/authn/credentials/reset_password`
      const requestPasswordReset = {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newPassword: password,
          stateToken: resetResponse.stateToken
        })
      }

      const passwordData = await oktaClient.http.http(urlPasswordReset, requestPasswordReset)
      const passwordResponse = await passwordData.json() as PasswordResetResponse
      const hashedPassword = await hashPassword(password)

      const params = {
        TableName: USERS_TABLE,
        Key: {
          email: passwordResponse._embedded.user.profile.login
        },
        UpdateExpression: 'set password = :p',
        ExpressionAttributeValues: {
          ':p': hashedPassword
        },
        ReturnValues: 'ALL_OLD'
      }
      await dynamoDb.update(params).promise()

      res.json(passwordResponse)
    } catch (error) {
      logger.error(error)
      res.status(500).json({ error: 'Could not reset user password' })
    }
  })

  route.post('/request/reset', async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { email } = req.body as User
      const oktaClient = await getOktaClient()

      // Check if they are already registered

      const validateURL = `${process.env.OKTA_DOMAIN as string}/api/v1/users?limit=200&filter=profile.email+eq+%22${encodeURIComponent(email)}%22`
      const validateRequest = {
        method: 'get',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }

      const validateData = await oktaClient.http.http(validateURL, validateRequest)
      const validateUser = await validateData.json() as [AppUser] | []

      if (validateUser.length === 0) {
        return res.status(409).json({ error: 'A user with this e-mail does not exist' })
      }

      // Get reset token for user

      const id = validateUser.length ? validateUser[0].id : ''
      const resetURL = `${process.env.OKTA_DOMAIN as string}/api/v1/users/${id}/lifecycle/reset_password?sendEmail=false`
      const resetRequest = {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }

      const resetData = await oktaClient.http.http(resetURL, resetRequest)
      const reset = await resetData.json() as { resetPasswordUrl: string }
      const tokenRegex = /[^/]+$/
      const match = reset.resetPasswordUrl.match(tokenRegex)
      const token = match && match.length > 0 ? match[0] : ''

      // Send out notification e-mail with token link

      const sesParams = {
        Destination: {
          ToAddresses: [
            'jessemull@gmail.com'
          ]
        },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: `${process.env.BASE_URL as string}/reset?token=${token}`
            },
            Text: {
              Charset: 'UTF-8',
              Data: `${process.env.BASE_URL as string}/reset?token=${token}`
            }
          },
          Subject: {
            Charset: 'UTF-8',
            Data: 'Peanut Butter Box password recovery. Reset your password now!'
          }
        },
        Source: 'support@peanutbutterbox.org'
      }

      await ses.sendEmail(sesParams).promise()

      // Return OKTA user

      res.status(200).send()
    } catch (error) {
      logger.error(error)
      res.status(500).json({ error: 'Could not reset user password' })
    }
  })

  route.post('/', async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { email, firstName, lastName } = req.body as User
      const oktaClient = await getOktaClient()

      // Check if they are already registered

      const validateURL = `${process.env.OKTA_DOMAIN as string}/api/v1/users?limit=200&filter=profile.email+eq+%22${encodeURIComponent(email)}%22`
      const validateRequest = {
        method: 'get',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }

      const validateData = await oktaClient.http.http(validateURL, validateRequest)
      const validateUser = await validateData.json() as [AppUser]

      if (validateUser.length > 0) {
        return res.status(409).json({ error: 'A user with this e-mail already exists' })
      }

      // Create inactive OKTA user

      const url = `${process.env.OKTA_DOMAIN as string}/api/v1/users?activate=false`
      const request = {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profile: {
            email,
            firstName,
            lastName,
            login: email
          }
        })
      }

      const data = await oktaClient.http.http(url, request)
      const user = await data.json() as AppUser

      // Get activation token for user

      const activationURL = `${process.env.OKTA_DOMAIN as string}/api/v1/users/${user.id}/lifecycle/activate?sendEmail=false`
      const activationRequest = {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }

      const activationData = await oktaClient.http.http(activationURL, activationRequest)
      const activation = await activationData.json() as { activationToken: string }

      // Send out notification e-mail with token link

      const sesParams = {
        Destination: {
          ToAddresses: [
            'jessemull@gmail.com'
          ]
        },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: `${process.env.BASE_URL as string}/activate?token=${activation.activationToken}`
            },
            Text: {
              Charset: 'UTF-8',
              Data: `${process.env.BASE_URL as string}/activate?token=${activation.activationToken}`
            }
          },
          Subject: {
            Charset: 'UTF-8',
            Data: 'Welcome to Peanut Butter Box! Activate your account now!'
          }
        },
        Source: 'support@peanutbutterbox.org'
      }

      await ses.sendEmail(sesParams).promise()

      // Create dynamo user

      const params = {
        TableName: USERS_TABLE,
        Item: {
          id: user.id,
          email,
          firstName,
          lastName,
          login: email,
          status: 'INACTIVE'
        },
        ReturnValues: 'ALL_OLD'
      }
      await dynamoDb.put(params).promise()

      // Return OKTA user

      res.json(user)
    } catch (error) {
      logger.error(error)
      res.status(500).json({ error: 'Could not create user' })
    }
  })

  route.put('/', async (req: Request, res: Response): Promise<void | Response> => {
    try {
      // Retrieve e-mail from event context via authorizer JWT

      const email = get(req, 'event.requestContext.authorizer.claims.sub', '') as string // eslint-disable-line

      // Bad JWT

      if (!email) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      // Update OKTA user

      const { firstName, lastName } = req.body as User
      const oktaClient = await getOktaClient()
      const user = await oktaClient.getUser(email)
      user.profile.firstName = firstName
      user.profile.lastName = lastName
      await user.update()

      // Update dynamo user

      const params = {
        TableName: USERS_TABLE,
        Key: {
          email
        },
        UpdateExpression: 'set firstName = :f, lastName = :l',
        ExpressionAttributeValues: {
          ':f': firstName,
          ':l': lastName
        },
        ReturnValues: 'ALL_OLD'
      }
      await dynamoDb.update(params).promise()

      // Return OKTA user

      res.json(user)
    } catch (error) {
      logger.error(error)
      res.status(500).json({ error: 'Could not update user' })
    }
  })

  route.delete('/', async (req: Request, res: Response): Promise<void | Response> => {
    try {
      // Retrieve e-mail from event context via authorizer JWT

      const email = get(req, 'event.requestContext.authorizer.claims.sub', '') as string // eslint-disable-line

      // Bad JWT

      if (!email) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      // Delete the user from OKTA

      const oktaClient = await getOktaClient()
      const user = await oktaClient.getUser(email)
      await user.deactivate()
      await user.delete()

      // Delete the user from dynamo

      const params = {
        TableName: USERS_TABLE,
        Key: {
          email
        }
      }
      await dynamoDb.delete(params).promise()

      // Return 204 for successful delete

      res.status(204).send()
    } catch (error) {
      logger.error(error)
      res.status(500).json({ error: 'Could not delete user' })
    }
  })
}
