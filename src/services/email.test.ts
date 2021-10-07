import { mocked } from 'ts-jest/utils'
import client from '../lib/ses-client'
import { MessageInput } from '../types'
import { sendActivation, sendContactMessage, sendPasswordReset } from './email'

jest.mock('../lib/ses-client')

const baseUrl = process.env.BASE_URL as string

const { sendEmail } = mocked(client)

sendEmail.mockImplementation(() => ({ promise: () => Promise.resolve() }) as any)

describe('email service', () => {
  it('should send password reset', async () => {
    const sesParams = {
      Destination: {
        ToAddresses: [
          'jessemull@gmail.com'
        ]
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `${baseUrl}/activate?token=token`
          },
          Text: {
            Charset: 'UTF-8',
            Data: `${baseUrl}/activate?token=token`
          }
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'Welcome to Peanut Butter Box! Activate your account now!'
        }
      },
      Source: 'support@peanutbutterbox.org'
    }
    await sendActivation('token')
    expect(sendEmail).toHaveBeenCalledWith(sesParams)
  })
  it('should send activation', async () => {
    const sesParams = {
      Destination: {
        ToAddresses: [
          'jessemull@gmail.com'
        ]
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `${baseUrl}/activate?token=token`
          },
          Text: {
            Charset: 'UTF-8',
            Data: `${baseUrl}/activate?token=token`
          }
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'Welcome to Peanut Butter Box! Activate your account now!'
        }
      },
      Source: 'support@peanutbutterbox.org'
    }
    await sendPasswordReset('token')
    expect(sendEmail).toHaveBeenCalledWith(sesParams)
  })
  it('should send contact message', async () => {
    const message = {
      email: 'first.last@domain.com',
      firstName: 'firstName',
      lastName: 'lastName',
      message: 'message'
    }
    const sesParams = {
      Destination: {
        ToAddresses: [
          'contact@peanutbutterbox.org'
        ]
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: 'First Name: firstName\n' +
                  'LastName: lastName\n' +
                  'E-mail: first.last@domain.com\n\n' +
                  'message'
          },
          Text: {
            Charset: 'UTF-8',
            Data: 'First Name: firstName\n' +
                  'LastName: lastName\n' +
                  'E-mail: first.last@domain.com\n\n' +
                  'message'
          }
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'Support for firstName lastName'
        }
      },
      Source: 'support@peanutbutterbox.org'
    }
    await sendContactMessage(message as MessageInput)
    expect(sendEmail).toHaveBeenCalledWith(sesParams)
  })
})
