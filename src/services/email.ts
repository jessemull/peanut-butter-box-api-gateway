import client from '../lib/ses-client'
import { MessageInput, SendPasswordResetInput } from '../types'

const baseUrl = process.env.BASE_URL as string

export const sendPasswordReset = async ({ firstName, login, token }: SendPasswordResetInput): Promise<void> => {
  const href = `${baseUrl}/reset?token=${token}`
  const support = `${baseUrl}/contact`
  const sesParams = {
    ConfigurationSetName: 'peanutbutterbox',
    Destination: {
      ToAddresses: [
        'jessemull@gmail.com'
      ]
    },
    Template: 'RequestPasswordReset',
    TemplateData: `{ "firstName": "${firstName}", "login": "${login}", "href": "${href}", "support": "${support}" }`,
    Source: 'support@peanutbutterbox.org'
  }

  await client.sendTemplatedEmail(sesParams).promise()
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
