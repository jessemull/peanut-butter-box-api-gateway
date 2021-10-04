import { Router, Request, Response } from 'express'
import logger from '../../lib/logger'
import { SupportService } from '../../services'
import { Message } from '../../types'

const route: Router = Router()

export default (app: Router): void => {
  app.use('/support', route)

  route.post('/', async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { date, email, firstName, lastName, message } = req.body as Message
      await SupportService.createMessage({ date, email, firstName, lastName, message })
      await SupportService.sendMessage({ date, email, firstName, lastName, message })
      res.status(200).send()
    } catch (error) {
      logger.error(error)
      res.status(500).json({ error: 'Could not send message!' })
    }
  })
}
