import { mocked } from 'ts-jest/utils'
import { AWSError } from 'aws-sdk'
import { SendEmailResponse } from 'aws-sdk/clients/ses'
import client from '../lib/ses-client'
import { sendActivation, sendPasswordReset } from './email'
jest.mock('../lib/ses-client')

const baseUrl = process.env.BASE_URL as string

const { sendEmail } = mocked(client)

sendEmail.mockImplementation(() => ({ promise: () => Promise.resolve() }) as any) // eslint-disable-line

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
})
