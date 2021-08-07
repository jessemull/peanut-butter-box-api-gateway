import decodeJWT from 'jwt-decode'
import { Router, Request, Response } from 'express'
import dynamoDb from '../lib/dynamo'
import getOktaClient from '../lib/okta'
import logger from '../lib/logger'
import { User } from '../../types/users'

const USERS_TABLE = process.env.USERS_TABLE || 'users-table-dev'
const route: Router = Router()

export default (app: Router): void => {
  app.use('/users', route)

  route.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
      const authorization = req.headers.authorization || ''
      const split = authorization?.split(' ')
      const jwt: { sub: string } = decodeJWT(split[1])
      const email = jwt.sub
      const params = {
        TableName: USERS_TABLE,
        Key: {
          email
        }
      }
      const data = await dynamoDb.get(params).promise()
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

  route.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
      const oktaClient = await getOktaClient()
      const { email, firstName, lastName, password } = req.body as User
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
      res.json(user)
    } catch (error) {
      logger.error(error)
      res.status(500).json({ error: 'Could not create user' })
    }
  })

  route.put('/:id', async (req: Request, res: Response): Promise<void> => {
    const { email, firstName, lastName, login } = req.body as User
    const params = {
      TableName: USERS_TABLE,
      Item: {
        id: req.params.id,
        email,
        firstName,
        lastName,
        login
      },
      ReturnValues: 'ALL_OLD'
    }
    try {
      const user = await dynamoDb.put(params).promise()
      res.json(user.Attributes)
    } catch (error) {
      logger.error(error)
      res.status(500).json({ error: 'Could not update user' })
    }
  })
}
