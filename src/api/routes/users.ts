import { v4 as uuidv4 } from 'uuid'
import { Router, Request, Response } from 'express'
import dynamoDb from '../lib/dynamo'
import logger from '../lib/logger'
import { User } from '../../types/users'
import getOktaClient from '../lib/okta'

const USERS_TABLE = process.env.USERS_TABLE || 'users-table-dev'
const route: Router = Router()

export default (app: Router): void => {
  app.use('/users', route)
  route.get('/', async (req: Request, res: Response): Promise<void> => {
    const params = {
      TableName: USERS_TABLE
    }
    try {
      const users = await dynamoDb.scan(params).promise()
      res.json(users.Items)
    } catch (error) {
      logger.error(error)
      res.status(500).json({ error: 'Could not fetch users' })
    }
  })

  route.get('/:id', async (req: Request, res: Response): Promise<void> => {
    const params = {
      TableName: USERS_TABLE,
      Key: {
        id: req.params.id
      }
    }
    try {
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
    const params = {
      TableName: USERS_TABLE,
      Item: {
        id: uuidv4(),
        email,
        firstName,
        lastName,
        login: email
      },
      ReturnValues: 'ALL_OLD'
    }
    try {
      const oktaClient = await getOktaClient()
      const user = await oktaClient.createUser(newUser)
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

  route.delete('/:id', async (req: Request, res: Response): Promise<void> => {
    const params = {
      TableName: USERS_TABLE,
      Key: {
        id: req.params.id
      },
      ReturnValues: 'ALL_OLD'
    }
    try {
      const data = await dynamoDb.delete(params).promise()
      if (data.Attributes) {
        res.status(200).send()
      } else {
        res.status(404).json({ error: 'User not found' })
      }
    } catch (error) {
      logger.error(error)
      res.status(500).json({ error: 'Could not delete user' })
    }
  })
}
