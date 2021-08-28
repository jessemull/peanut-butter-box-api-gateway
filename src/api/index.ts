import { Router } from 'express'
import healthcheck from './routes/healthcheck'
import products from './routes/products'
import users from './routes/users'

const routes = (): Router => {
  const app = Router()
  healthcheck(app)
  products(app)
  users(app)
  return app
}

export default routes
