import get from 'lodash.get'
import { Router, Request, Response } from 'express'
import logger from '../../lib/logger'
import { Activation, ChangePasswordInput, Reset, User, UserResponse } from '../../types'
import { DynamoDBUserService, EmailService, OktaUserService } from '../../services'

const route: Router = Router()

export default (app: Router): void => {
  app.use('/users', route)

  route.get('/', async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const email = get(req, 'event.requestContext.authorizer.email', '') as string
      if (!email) {
        logger.error('Invalid user JWT')
        return res.status(401).json({ error: 'Invalid user JWT' })
      }
      const user = await DynamoDBUserService.getUser(email)
      if (user) {
        const { city, countryCode, id, email, firstName, lastName, login, primaryPhone, state, streetAddress, zipCode } = user
        res.json({ city, countryCode, id, email, firstName, lastName, login, primaryPhone, state, streetAddress, zipCode })
      } else {
        res.status(404).json({ error: 'User not found' })
      }
    } catch (error) {
      logger.error(error)
      res.status(500).json({ error: 'Could not fetch user' })
    }
  })

  route.post('/change', async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const email = get(req, 'event.requestContext.authorizer.email', '') as string
      if (!email) {
        logger.error('Invalid user JWT')
        return res.status(401).json({ error: 'Invalid user JWT' })
      }
      const { id, newPassword, oldPassword } = req.body as ChangePasswordInput
      await OktaUserService.changePassword({ id, newPassword, oldPassword })
      await DynamoDBUserService.changePassword(email, newPassword)
      res.status(200).send()
    } catch (error) {
      logger.error(error)
      res.status(500).json({ error: 'Failed to change password!' })
    }
  })

  route.post('/verify', async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { activationToken, password } = req.body as Activation
      const stateToken = await OktaUserService.getStateToken(activationToken)
      const { email, response } = await OktaUserService.resetPassword(password, stateToken)
      await DynamoDBUserService.verifyUser(email, password)
      res.json(response)
    } catch (error) {
      logger.error(error)
      res.status(500).json({ error: 'Could not verify user' })
    }
  })

  route.post('/reset', async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { resetToken, password } = req.body as Reset
      const stateToken = await OktaUserService.getStateToken(resetToken)
      const { email, response } = await OktaUserService.resetPassword(password, stateToken)
      await DynamoDBUserService.resetUserPassword(email, password)
      res.json(response)
    } catch (error) {
      logger.error(error)
      res.status(500).json({ error: 'Could not reset user password' })
    }
  })

  route.post('/request/reset', async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { email } = req.body as User
      const user = await OktaUserService.doesUserExist(email) as UserResponse
      if (!user) {
        return res.status(404).json({ error: 'A user with this e-mail does not exist' })
      }
      const token = await OktaUserService.getResetToken(user.id)
      await EmailService.sendPasswordReset({ firstName: user.profile.firstName, login: user.profile.login, token })
      res.status(200).send()
    } catch (error) {
      logger.error(error)
      res.status(500).json({ error: 'Could not reset user password' })
    }
  })

  route.post('/', async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { email, firstName, lastName } = req.body as User
      const existingUser = await OktaUserService.doesUserExist(email)
      if (existingUser) {
        return res.status(409).json({ error: 'A user with this e-mail already exists!' })
      }
      const user = await OktaUserService.createUser({ email, firstName, lastName })
      const activationToken = await OktaUserService.getActivationToken(user.id)
      await EmailService.sendActivation({ activationToken, firstName })
      await DynamoDBUserService.createUser({ id: user.id, email, firstName, lastName })
      res.json(user)
    } catch (error) {
      logger.error(error)
      res.status(500).json({ error: 'Sign up failed!' })
    }
  })

  route.put('/', async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const email = get(req, 'event.requestContext.authorizer.email', '') as string
      if (!email) {
        logger.error('Invalid user JWT')
        return res.status(401).json({ error: 'Invalid user JWT' })
      }
      const { city, countryCode, firstName, lastName, primaryPhone, state, streetAddress, zipCode } = req.body as User
      const user = await OktaUserService.updateUser({ city, countryCode, email, firstName, lastName, primaryPhone, state, streetAddress, zipCode })
      await DynamoDBUserService.updateUser({ city, countryCode, email, firstName, lastName, primaryPhone, state, streetAddress, zipCode })
      res.json(user)
    } catch (error) {
      logger.error(error)
      res.status(500).json({ error: 'Could not update user!' })
    }
  })

  route.delete('/', async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const email = get(req, 'event.requestContext.authorizer.email', '') as string
      if (!email) {
        logger.error('Invalid user JWT')
        return res.status(401).json({ error: 'Invalid user JWT' })
      }
      await OktaUserService.deleteUser(email)
      await DynamoDBUserService.deleteUser(email)
      res.status(204).send()
    } catch (error) {
      logger.error(error)
      res.status(500).json({ error: 'Could not delete user' })
    }
  })
}
