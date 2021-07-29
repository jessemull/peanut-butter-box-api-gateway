import { Request, Response, NextFunction } from 'express'
import logger from '../lib/logger'
import { Error } from '../../types/errors'

const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction): void => { // eslint-disable-line
  logger.error(err)
  res.status(err.status || 500)
  res.json({
    errors: {
      message: err.message
    }
  })
}

export default errorMiddleware
