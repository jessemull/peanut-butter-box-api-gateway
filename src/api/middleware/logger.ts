import get from 'lodash.get'
import { Request, Response, NextFunction } from 'express'
import logger from '../../lib/logger'

const loggerRequestMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  logger.info(get(req, 'event'))
  next()
}

export default loggerRequestMiddleware
