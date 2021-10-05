import get from 'lodash.get'
import dynamo from '../lib/dynamo'
import { Message, Messages } from '../types'

const MESSAGES_TABLE = process.env.MESSAGES_TABLE || 'messages-table-dev'

export const getMessages = async (email: string): Promise<Array<Message>> => {
  const params = {
    TableName: MESSAGES_TABLE,
    Key: {
      email
    }
  }
  const data = await dynamo.get(params).promise()
  return get(data, 'Item.messages', []) as Array<Message>
}

export const updateMessages = async ({ email, messages }: Messages): Promise<Messages> => {
  const params = {
    TableName: MESSAGES_TABLE,
    Key: {
      email
    },
    UpdateExpression: 'set messages = :m',
    ExpressionAttributeValues: {
      ':m': messages
    },
    ReturnValues: 'ALL_NEW'
  }
  const data = await dynamo.update(params).promise()
  return data.Attributes as Messages
}
