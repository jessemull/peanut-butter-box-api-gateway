import { Router } from 'express'
import healthcheck from './routes/healthcheck'
import places from './routes/places'
import products from './routes/products'
import support from './routes/support'
import users from './routes/users'
import usps from './routes/usps'

const routes = (): Router => {
  const app = Router()
  healthcheck(app)
  places(app)
  products(app)
  support(app)
  users(app)
  usps(app)
  return app
}

export default routes
