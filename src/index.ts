import bodyParser from 'body-parser'
import cors from 'cors'
import Express, { Application } from 'express'
import serverless from 'serverless-http'
import authorizer from './api/authorizer'
import errorMiddleware from './api/middleware/error'
import loggerRequestMiddleware from './api/middleware/logger'
import routes from './api/index'

const createApp = (): Application => {
  const app = Express()
  app.use(cors()) // eslint-disable-line
  app.use(bodyParser.json({ strict: false }))
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
  authorizer,
  createApp,
  handler
}
