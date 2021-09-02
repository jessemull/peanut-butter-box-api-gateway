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
    const user = {
      email,
      password
    }
    const params = {
      TableName: USERS_TABLE,
      Key: {
        email
      },
      UpdateExpression: 'set password = :p',
      ExpressionAttributeValues: {
        ':p': password
      },
      ReturnValues: 'ALL_NEW'
    }
    update.mockImplementationOnce(() => ({ promise: () => Promise.resolve({ Attributes: user }) } as any))
    const data = await resetUserPassword(email, password)
    expect(update).toHaveBeenLastCalledWith(params)
    expect(data).toEqual(user)
  })
  it('should update user', async () => {
    const user = {
      city: 'city',
      email: 'first.last@domain.com',
      firstName: 'first',
      lastName: 'last',
      primaryPhone: '555-123-5678',
      state: 'OR',
      streetAddress: '1234 Fake St',
      zipCode: '12345'
    }
    const params = {
      TableName: USERS_TABLE,
      Key: {
        email: user.email
      },
      UpdateExpression: 'set city = :c, firstName = :f, lastName = :l, primaryPhone = :p, state = :st, streetAddress = :sa, zipCode = :z',
      ExpressionAttributeValues: {
        ':c': user.city,
        ':f': user.firstName,
        ':l': user.lastName,
        ':p': user.primaryPhone,
        ':st': user.state,
        ':sa': user.streetAddress,
        ':z': user.zipCode
      },
      ReturnValues: 'ALL_NEW'
    }
    update.mockImplementationOnce(() => ({ promise: () => Promise.resolve({ Attributes: user }) } as any))
    const data = await updateUser(user)
    expect(update).toHaveBeenLastCalledWith(params)
    expect(data).toEqual(user)
  })
  it('should verify user', async () => {
    const email = 'first.last@domain.com'
    const password = 'password'
    const user = {
      email,
      password
    }
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
    update.mockImplementationOnce(() => ({ promise: () => Promise.resolve({ Attributes: user }) } as any))
    const data = await verifyUser(email, password)
    expect(update).toHaveBeenCalledWith(params)
    expect(data).toEqual(user)
  })
})
