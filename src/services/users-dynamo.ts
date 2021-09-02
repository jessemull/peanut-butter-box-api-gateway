import client from '../lib/dynamo'
import hashPassword from '../lib/hash'
import { CreateUserInput, UpdateUserInput, User } from '../types'

const USERS_TABLE = process.env.USERS_TABLE || 'users-table-dev'

export const createUser = async ({ id, email, firstName, lastName }: CreateUserInput): Promise<void> => {
  const params = {
    TableName: USERS_TABLE,
    Item: {
      id,
      email,
      firstName,
      lastName,
      login: email,
      status: 'INACTIVE'
    },
    ReturnValues: 'ALL_OLD'
  }
  await client.put(params).promise()
}

export const deleteUser = async (email: string): Promise<void> => {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      email
    }
  }
  await client.delete(params).promise()
}

export const getUser = async (email: string): Promise<User | null> => {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      email
    }
  }
  const data = await client.get(params).promise()
  return data.Item as User
}

export const resetUserPassword = async (email: string, password: string): Promise<User> => {
  const hashedPassword = await hashPassword(password)

  const params = {
    TableName: USERS_TABLE,
    Key: {
      email
    },
    UpdateExpression: 'set password = :p',
    ExpressionAttributeValues: {
      ':p': hashedPassword
    },
    ReturnValues: 'ALL_NEW'
  }

  const data = await client.update(params).promise()
  return data.Attributes as User
}

export const updateUser = async ({ city, email, firstName, lastName, primaryPhone, state, streetAddress, zipCode }: UpdateUserInput): Promise<User> => {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      email
    },
    UpdateExpression: 'set city = :c, firstName = :f, lastName = :l, primaryPhone = :p, #st = :st, streetAddress = :sa, zipCode = :z',
    ExpressionAttributeValues: {
      ':c': city,
      ':f': firstName,
      ':l': lastName,
      ':p': primaryPhone,
      ':st': state,
      ':sa': streetAddress,
      ':z': zipCode
    },
    ExpressionAttributeNames: {
      '#st': 'state'
    },
    ReturnValues: 'ALL_NEW'
  }
  const data = await client.update(params).promise()
  return data.Attributes as User
}

export const verifyUser = async (email: string, password: string): Promise<User> => {
  const hashedPassword = await hashPassword(password)
  const params = {
    TableName: USERS_TABLE,
    Key: {
      email
    },
    UpdateExpression: 'set password = :p, #st = :s',
    ExpressionAttributeValues: {
      ':p': hashedPassword,
      ':s': 'ACTIVE'
    },
    ExpressionAttributeNames: {
      '#st': 'status'
    },
    ReturnValues: 'ALL_OLD'
  }
  const data = await client.update(params).promise()
  return data.Attributes as User
}
