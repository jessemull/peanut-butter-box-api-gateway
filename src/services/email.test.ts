import { mocked } from 'ts-jest/utils'
import client from '../lib/ses-client'
import { MessageInput } from '../types'
import { sendActivation, sendContactMessage, sendPasswordReset } from './email'

jest.mock('../lib/ses-client')

const baseUrl = process.env.BASE_URL as string

const { sendTemplatedEmail } = mocked(client)

sendTemplatedEmail.mockImplementation(() => ({ promise: () => Promise.resolve() }) as any)

describe('email service', () => {
  it('should send activation', async () => {
    const input = {
      activationToken: 'token',
      firstName: 'firstName'
    }
    const sesParams = {
      ConfigurationSetName: 'peanutbutterbox',
      Destination: {
        ToAddresses: [
          'jessemull@gmail.com'
        ]
      },
      Template: 'Activation',
      TemplateData: `{ "firstName": "${input.firstName}", "href": "${`${baseUrl}/activate?token=${input.activationToken}`}" }`,
      Source: 'support@peanutbutterbox.org'
    }
    await sendActivation(input)
    expect(sendTemplatedEmail).toHaveBeenCalledWith(sesParams)
  })
  it('should send password reset', async () => {
    const input = {
      firstName: 'firstName',
      login: 'login',
      token: 'token'
    }
    const sesParams = {
      ConfigurationSetName: 'peanutbutterbox',
      Destination: {
        ToAddresses: [
          'jessemull@gmail.com'
        ]
      },
      Template: 'RequestPasswordReset',
      TemplateData: `{ "firstName": "${input.firstName}", "login": "${input.login}", "href": "${`${baseUrl}/reset?token=${input.token}`}", "support": "${`${baseUrl}/contact`}" }`,
      Source: 'support@peanutbutterbox.org'
    }
    await sendPasswordReset(input)
    expect(sendTemplatedEmail).toHaveBeenCalledWith(sesParams)
  })
  it('should send contact message', async () => {
    const input = {
      email: 'first.last@domain.com',
      firstName: 'firstName',
      lastName: 'lastName',
      message: 'message'
    }
    const sesParams = {
      ConfigurationSetName: 'peanutbutterbox',
      Destination: {
        ToAddresses: [
          'contact@peanutbutterbox.org'
        ]
      },
      Template: 'Support',
      TemplateData: `{ "firstName": "${input.firstName}", "lastName": "${input.lastName}", "email": "${input.email}", "message": "${input.message}" }`,
      Source: 'support@peanutbutterbox.org'
    }
    await sendContactMessage(input as MessageInput)
    expect(sendTemplatedEmail).toHaveBeenCalledWith(sesParams)
  })
})
