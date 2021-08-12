import { mocked } from 'ts-jest/utils'
import client from '../lib/dynamo'
import { createUser, deleteUser, getUser, resetUserPassword, updateUser, verifyUser } from './users-dynamo'

const USERS_TABLE = process.env.USERS_TABLE || 'users-table-dev'

jest.mock('../lib/dynamo')
jest.mock('../lib/hash', () => (password) => password)

const { delete: dynamoDelete, get, put, update } = mocked(client)

describe('dynamo user service', () => {
  it('should create user', async () => {
    const user = {
      id: 'id',
      email: 'first.last@domain.com',
      firstName: 'first',
      lastName: 'last'
    }
    const params = {
      TableName: USERS_TABLE,
      Item: {
        ...user,
        login: user.email,
        status: 'INACTIVE'
      },
      ReturnValues: 'ALL_OLD'
    }
    put.mockImplementationOnce(() => ({ promise: () => Promise.resolve({ Item: user }) } as any))
    await createUser(user)
    expect(put).toHaveBeenCalledWith(params)
  })
  it('should delete user', async () => {
    const email = 'first.last@domain.com'
    const params = {
      TableName: USERS_TABLE,
      Key: {
        email
      }
    }
    dynamoDelete.mockImplementationOnce(() => ({ promise: () => Promise.resolve() } as any))
    await deleteUser(email)
    expect(dynamoDelete).toHaveBeenLastCalledWith(params)
  })
  it('should get user', async () => {
    const email = 'first.last@domain.com'
    const params = {
      TableName: USERS_TABLE,
      Key: {
        email
      }
    }
    const user = { id: 'id' }
    get.mockImplementationOnce(() => ({ promise: () => Promise.resolve({ Item: user }) } as any))
    const response = await getUser(email)
    expect(response).toEqual(user)
    expect(get).toHaveBeenLastCalledWith(params)
  })
  it('should reset user password', async () => {
    const password = 'password'
    const email = 'first.last@domain.com'
    const params = {
      TableName: USERS_TABLE,
      Key: {
        email
      },
      UpdateExpression: 'set password = :p',
      ExpressionAttributeValues: {
        ':p': password
      },
      ReturnValues: 'ALL_OLD'
    }
    update.mockImplementationOnce(() => ({ promise: () => Promise.resolve() } as any))
    await resetUserPassword(email, password)
    expect(update).toHaveBeenLastCalledWith(params)
  })
  it('should update user', async () => {
    const user = {
      email: 'first.last@domain.com',
      firstName: 'first',
      lastName: 'last'
    }
    const params = {
      TableName: USERS_TABLE,
      Key: {
        email: user.email
      },
      UpdateExpression: 'set firstName = :f, lastName = :l',
      ExpressionAttributeValues: {
        ':f': user.firstName,
        ':l': user.lastName
      },
      ReturnValues: 'ALL_OLD'
    }
    update.mockImplementationOnce(() => ({ promise: () => Promise.resolve() } as any))
    await updateUser(user)
    expect(update).toHaveBeenLastCalledWith(params)
  })
  it('should verify user', async () => {
    const email = 'first.last@domain.com'
    const password = 'password'
    const params = {
      TableName: USERS_TABLE,
      Key: {
        email
      },
      UpdateExpression: 'set password = :p, #st = :s',
      ExpressionAttributeValues: {
        ':p': password,
        ':s': 'ACTIVE'
      },
      ExpressionAttributeNames: {
        '#st': 'status'
      },
      ReturnValues: 'ALL_OLD'
    }
    update.mockImplementationOnce(() => ({ promise: () => Promise.resolve() } as any))
    await verifyUser(email, password)
    expect(update).toHaveBeenCalledWith(params)
  })
})
