import decodeJWT from 'jwt-decode'
import { Router, Request, Response } from 'express'
import dynamoDb from '../lib/dynamo'
import getOktaClient from '../lib/okta'
import logger from '../lib/logger'
import { User } from '../../types/users'
import { JWT } from '../../types/auth'

const USERS_TABLE = process.env.USERS_TABLE || 'users-table-dev'
const route: Router = Router()

export default (app: Router): void => {
  app.use('/users', route)

  route.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
      // Retrieve e-mail from JWT

      const authorization = req.headers.authorization || ''
      const split = authorization?.split(' ')
      const jwt: JWT = decodeJWT(split[1])
      const email = jwt.sub

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

  route.post('/', async (req: Request, res: Response): Promise<void | Response> => {
    try {
      // Check if they are already registered

      const { email, firstName, lastName, password } = req.body as User
      const oktaClient = await getOktaClient()
      const existingUser = await oktaClient.getUser(email)
      if (existingUser) {
        return res.status(409).json({ error: 'A user with this e-mail already exists' })
      }

      // Create OKTA user

      const newUser = {
        profile: {
          email,
          firstName,
          lastName,
          login: email
        },
        credentials: {
          password: {
            value: password
          }
        }
      }

      const user = await oktaClient.createUser(newUser)

      // Create dynamo user

      const params = {
        TableName: USERS_TABLE,
        Item: {
          id: user.id,
          email,
          firstName,
          lastName,
          login: email
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

  route.put('/', async (req: Request, res: Response): Promise<void> => {
    try {
      // Retrieve e-mail from JWT

      const authorization = req.headers.authorization || ''
      const split = authorization?.split(' ')
      const jwt: JWT = decodeJWT(split[1])
      const email = jwt.sub
      const { firstName, lastName } = req.body as User

      // Update OKTA user

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

  route.delete('/', async (req: Request, res: Response): Promise<void> => {
    try {
      // Retrieve e-mail from JWT

      const authorization = req.headers.authorization || ''
      const split = authorization?.split(' ')
      const jwt: { sub: string } = decodeJWT(split[1])
      const email = jwt.sub

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
