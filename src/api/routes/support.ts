import { Router, Request, Response } from 'express'
import logger from '../../lib/logger'
import { EmailService, SupportService } from '../../services'
import { MessageInput } from '../../types'

const route: Router = Router()

export default (app: Router): void => {
  app.use('/support', route)

  route.post('/', async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { date, email, firstName, lastName, message } = req.body as MessageInput
      const messages = await SupportService.getMessages(email)
      await SupportService.updateMessages({ email, messages: [...messages, { date, firstName, lastName, message }] })
      await EmailService.sendContactMessage({ date, email, firstName, lastName, message })
      res.status(200).send()
    } catch (error) {
      logger.error(error)
      res.status(500).json({ error: 'Could not send message!' })
    }
  })
}
