import loggerMiddleware from './logger'
import logger from '../../lib/logger'

describe('logger middleware', () => {
  it('should log all requests', () => {
    const req = { body: { email: 'first.last@domain.com' } }
    const res = {}
    const next = jest.fn()
    loggerMiddleware(req as any, res as any, next as any) // eslint-disable-line
    expect(logger.info).toHaveBeenCalledWith(req.toString())
    expect(next).toHaveBeenCalledTimes(1)
  })
})
