
import { Router, Request, Response } from 'express'
import dynamoDb from '../../lib/dynamo'
import logger from '../../lib/logger'
import { User } from '../../types/users';

const USERS_TABLE = process.env.USERS_TABLE || 'users-table-dev'
const route: Router = Router()

export default (app: Router): void => {
  app.use('/users', route)
  route.get('/', async (req, res): void => {
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

  route.get('/:userId', async (req: Request, res: Response): void => {
    const params = {
      TableName: USERS_TABLE,
      Key: {
        userId: req.params.userId
      }
    }
    try {
      const data = await dynamoDb.get(params).promise()
      if (data.Item) {
        const { userId, name }: User = data.Item
        res.json({ userId, name } as User)
      } else {
        res.status(404).json({ error: 'User not found' })
      }
    } catch (error) {
      logger.error(error)
      res.status(500).json({ error: 'Could not fetch user' })
    }
  })

  route.post('/', async (req: Request, res: Response): void => {
    const { name } = req.body as User
    const params = {
      TableName: USERS_TABLE,
      Item: {
        userId: req.params.userId,
        name: name
      },
      ReturnValues: 'ALL_OLD'
    }
    try {
      const user = await dynamoDb.put(params).promise()
      res.json(user.Attributes)
    } catch (error) {
      logger.error(error)
      res.status(500).json({ error: 'Could not create user' })
    }
  })

  route.put('/:userId', async (req: Request, res: Response): void => {
    const { userId, name } = req.body as User
    const params = {
      TableName: USERS_TABLE,
      Item: {
        userId: userId,
        name: name
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

  route.delete('/:userId', async (req: Request, res: Response): void => {
    const params = {
      TableName: USERS_TABLE,
      Key: {
        userId: req.params.userId
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
