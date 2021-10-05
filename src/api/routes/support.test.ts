import bodyParser from 'body-parser'
import express, { Application } from 'express'
import supertest from 'supertest'
import { mocked } from 'ts-jest/utils'
import routes from '..'
import { EmailService, SupportService } from '../../services'

jest.mock('../../services')

const { getMessages, updateMessages } = mocked(SupportService)
const { sendContactMessage } = mocked(EmailService)

const getApp = (): Application => {
  const app = express()
  app.use(bodyParser.json({ strict: false }))
  app.use(routes())
  return app
}

describe('/support', () => {
  let app: Application
  beforeAll(() => {
    app = getApp()
  })
  it('POST upserts messages and sends support e-mail', async () => {
    const email = 'first.last@domain.com'
    const message = {
      date: '2021-10-05T03:09:11.018Z',
      firstName: 'firstName',
      lastName: 'lastName',
      message: 'This is a test message.'
    }
    const messageInput = {
      email,
      ...message
    }
    getMessages.mockResolvedValueOnce([])
    await supertest(app)
      .post('/support')
      .send(messageInput)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(200)
    expect(sendContactMessage).toHaveBeenCalledWith(messageInput)
    expect(updateMessages).toHaveBeenCalledWith({ email, messages: [message] })
  })
  it('POST catches errors and returns 500', async () => {
    const email = 'first.last@domain.com'
    const message = {
      date: '2021-10-05T03:09:11.018Z',
      firstName: 'firstName',
      lastName: 'lastName',
      message: 'This is a test message.'
    }
    const messageInput = {
      email,
      ...message
    }
    getMessages.mockImplementationOnce(() => {
      throw new Error()
    })
    const response = await supertest(app)
      .post('/support')
      .send(messageInput)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(500)
    expect(response.body).toEqual({ error: 'Could not send message!' })
  })
})
