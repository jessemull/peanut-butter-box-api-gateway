import { Router, Request, Response } from 'express'
import logger from '../../lib/logger'
import { USPSService } from '../../services'
import { Address } from '../../types'

const route: Router = Router()

export default (app: Router): void => {
  app.use('/usps', route)

  route.post('/verify', async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { Address1, Address2, City, State, Zip5 } = req.body as Address
      const verifiedAddress = await USPSService.verifyAddress({ Address1, Address2, City, State, Zip5 })
      res.json(verifiedAddress)
    } catch (error) {
      logger.error(error)
      res.status(500).json({ error: 'Could not validate address!' })
    }
  })
}
