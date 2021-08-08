import errorMiddleware from './error'

describe('error middleware', () => {
  it('should catch and log errors', () => {
    const req = {}
    const res = { status: jest.fn(), json: jest.fn() }
    const next = jest.fn()
    const error = { message: 'error', name: 'name' }
    errorMiddleware(error as any, req as any, res as any, next)
    expect(res.status).toHaveBeenLastCalledWith(500)
    expect(res.json).toHaveBeenLastCalledWith({
      errors: {
        message: 'error'
      }
    })
  })
})
