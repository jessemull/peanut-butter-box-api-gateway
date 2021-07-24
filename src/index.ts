import serverless from 'serverless-http'
import bodyParser from 'body-parser'
import express from 'express'
import routes from './api/index'
import errorMiddleware from './api/middleware/error'
import loggerRequestMiddleware from './api/middleware/logger'

const createApp = () => {
  const app = express()
  app.use(bodyParser.json({ strict: false }))
  app.use(loggerRequestMiddleware)
  app.use(routes())
  app.use(errorMiddleware)
  return app
}

const handler = serverless(createApp())

export {
  handler
}
