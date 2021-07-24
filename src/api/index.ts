import { Router } from 'express';
import healthcheck from './routes/healthcheck';
import users from './routes/users';

const routes = (): Router => {
  const app = Router()
  healthcheck(app)
  users(app)
  return app
}

export default routes
