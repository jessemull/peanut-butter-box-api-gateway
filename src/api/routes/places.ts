import { Router, Request, Response } from 'express'
import logger from '../../lib/logger'
import { PlacesService } from '../../services'
import { GetAddressesInput, GetCitiesInput, GetDetailsInput, GetStatesInput } from '../../types'

const route: Router = Router()

export default (app: Router): void => {
  app.use('/places', route)

  route.get('/autocomplete/address', async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { input } = req.query as unknown as GetAddressesInput
      const suggestions = await PlacesService.getAddresses({ input })
      res.json(suggestions)
    } catch (error) {
      logger.error(error)
      res.status(500).json({ error: 'Could not auto-complete address!' })
    }
  })

  route.get('/autocomplete/city', async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { input } = req.query as unknown as GetCitiesInput
      const suggestions = await PlacesService.getCities({ input })
      res.json(suggestions)
    } catch (error) {
      logger.error(error)
      res.status(500).json({ error: 'Could not auto-complete city!' })
    }
  })

  route.get('/autocomplete/state', (req: Request, res: Response): void | Response => {
    try {
      const { input } = req.query as unknown as GetStatesInput
      const suggestions = PlacesService.getStates({ input })
      res.json(suggestions)
    } catch (error) {
      logger.error(error)
      res.status(500).json({ error: 'Could not auto-complete state!' })
    }
  })

  route.get('/details', async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { placeId } = req.query as unknown as GetDetailsInput
      const details = await PlacesService.getDetails({ placeId })
      res.json(details)
    } catch (error) {
      logger.error(error)
      res.status(500).json({ error: 'Could not get place details!' })
    }
  })
}
