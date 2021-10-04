import client from '../lib/ses-client'
import dynamo from '../lib/dynamo'
import { Message } from '../types'

const MESSAGES_TABLE = process.env.MESSAGES_TABLE || 'messages-table-dev'

export const createMessage = async ({ date, email, firstName, lastName, message }: Message): Promise<Message> => {
  const params = {
    TableName: MESSAGES_TABLE,
    Key: {
      email
    },
    UpdateExpression: 'set date = :d, email = :e, firstName = :f, lastName = :l, message = :m',
    ExpressionAttributeValues: {
      ':d': date,
      ':e': email,
      ':f': firstName,
      ':l': lastName,
      ':m': message
    },
    ReturnValues: 'ALL_NEW'
  }
  const data = await dynamo.update(params).promise()
  return data.Attributes as Message
}

export const sendMessage = async ({ email, firstName, lastName, message }: Message): Promise<void> => {
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
