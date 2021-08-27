import cors from 'cors'
import Express, { Application } from 'express'
import serverless from 'serverless-http'
import errorMiddleware from './api/middleware/error'
import loggerRequestMiddleware from './api/middleware/logger'
import routes from './api/index'
import { adminauthorizer, authorizer } from './api/authorizer'

const createApp = (): Application => {
  const app = Express()
  app.use(cors()) // eslint-disable-line
  app.options('*', cors()) // eslint-disable-line
  app.use(Express.json())
  app.use(Express.urlencoded({ extended: true }))
  app.use(loggerRequestMiddleware)
  app.use(routes())
  app.use(errorMiddleware)
  return app
}

const handler = serverless(createApp(), {
  request: (req, event, context) => {
    req.event = event // eslint-disable-line
    req.context = context // eslint-disable-line
  }
})

export {
  adminauthorizer,
  authorizer,
  createApp,
  handler
}
