import client from '../lib/dynamo'
import hashPassword from '../lib/hash'
import { CreateUserInput, UpdateUserInput, User } from '../types'

const USERS_TABLE = process.env.USERS_TABLE || 'users-table-dev'

export const getUser = async (email: string): Promise<User> => {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      email
    }
  }

  const data = await client.get(params).promise()

  return data.Item as User
}

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

export const verifyUser = async (email: string, password: string): Promise<void> => {
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
  await client.update(params).promise()
}

export const resetUserPassword = async (email: string, password: string): Promise<void> => {
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
    ReturnValues: 'ALL_OLD'
  }

  await client.update(params).promise()
}

export const updateUser = async ({ email, firstName, lastName }: UpdateUserInput): Promise<void> => {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      email
    },
    UpdateExpression: 'set firstName = :f, lastName = :l',
    ExpressionAttributeValues: {
      ':f': firstName,
      ':l': lastName
    },
    ReturnValues: 'ALL_OLD'
  }
  await client.update(params).promise()
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
