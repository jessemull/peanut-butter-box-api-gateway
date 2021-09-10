import { Router } from 'express'
import healthcheck from './routes/healthcheck'
import places from './routes/places'
import products from './routes/products'
import users from './routes/users'
import usps from './routes/usps'

const routes = (): Router => {
  const app = Router()
  healthcheck(app)
  places(app)
  products(app)
  users(app)
  usps(app)
  return app
}

export default routes
