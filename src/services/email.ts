import client from '../lib/ses-client'
import { MessageInput } from '../types'

const baseUrl = process.env.BASE_URL as string

export const sendPasswordReset = async (token: string): Promise<void> => {
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
          Data: `${baseUrl}/reset?token=${token}`
        },
        Text: {
          Charset: 'UTF-8',
          Data: `${baseUrl}/reset?token=${token}`
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'Peanut Butter Box password recovery. Reset your password now!'
      }
    },
    Source: 'support@peanutbutterbox.org'
  }

  await client.sendEmail(sesParams).promise()
}

export const sendActivation = async (token: string): Promise<void> => {
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
          Data: `${baseUrl}/activate?token=${token}`
        },
        Text: {
          Charset: 'UTF-8',
          Data: `${baseUrl}/activate?token=${token}`
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'Welcome to Peanut Butter Box! Activate your account now!'
      }
    },
    Source: 'support@peanutbutterbox.org'
  }
  await client.sendEmail(sesParams).promise()
}

export const sendContactMessage = async ({ email, firstName, lastName, message }: MessageInput): Promise<void> => {
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
          Data: `First Name: ${firstName}\n` +
                `LastName: ${lastName}\n` +
                `E-mail: ${email}\n\n` +
                message
        },
        Text: {
          Charset: 'UTF-8',
          Data: `First Name: ${firstName}\n` +
                `LastName: ${lastName}\n` +
                `E-mail: ${email}\n\n` +
                message
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `Support for ${firstName} ${lastName}`
      }
    },
    Source: 'support@peanutbutterbox.org'
  }

  await client.sendEmail(sesParams).promise()
}
