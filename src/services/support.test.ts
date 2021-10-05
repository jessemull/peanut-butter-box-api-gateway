import { mocked } from 'ts-jest/utils'
import dynamo from '../lib/dynamo'
import { getMessages, updateMessages } from './support'

const MESSAGES_TABLE = process.env.MESSAGES_TABLE || 'messages-table-dev'

jest.mock('../lib/ses-client')
jest.mock('../lib/dynamo')

const { get, update } = mocked(dynamo)

describe('support service', () => {
  it('should get messages', async () => {
    const email = 'first.last@domain.com'
    const message = {
      date: '2021-10-05T03:09:11.018Z',
      firstName: 'firstName',
      lastName: 'lastName',
      message: 'This is a test message.'
    }
    const params = {
      TableName: MESSAGES_TABLE,
      Key: {
        email
      }
    }
    get.mockImplementationOnce(() => ({ promise: () => Promise.resolve({ Item: { messages: [message] } }) } as any))
    const response = await getMessages(email)
    expect(response).toEqual([message])
    expect(get).toHaveBeenLastCalledWith(params)
  })
  it('should update messages', async () => {
    const email = 'first.last@domain.com'
    const messages = [{
      date: '2021-10-05T03:09:11.018Z',
      firstName: 'firstName',
      lastName: 'lastName',
      message: 'This is a test message.'
    }]
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
    update.mockImplementationOnce(() => ({ promise: () => Promise.resolve({ Attributes: { email, messages } }) } as any))
    const response = await updateMessages({ email, messages })
    expect(response).toEqual({ email, messages })
    expect(update).toHaveBeenLastCalledWith(params)
  })
})
