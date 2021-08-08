import supertest from 'supertest'
import { createApp } from '../..'

jest.mock('fs', () => ({
  readFileSync: jest.fn(() => ('{ "version": "1.0.0" }'))
}))

describe('/healthcheck', () => {
  let app: Express.Application
  beforeAll(() => {
    app = createApp()
  })
  it('GET returns application version', async () => {
    const response = await supertest(app)
      .get('/healthcheck')
      .set('Accept', 'application/json')
      .expect(200)
    expect(JSON.parse(response.text)).toEqual('1.0.0')
  })
})
