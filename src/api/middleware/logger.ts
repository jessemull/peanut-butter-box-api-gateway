import { Request, Response, NextFunction } from 'express'
import logger from '../lib/logger'

const loggerRequestMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  logger.info(req.toString())
  next()
}

export default loggerRequestMiddleware
