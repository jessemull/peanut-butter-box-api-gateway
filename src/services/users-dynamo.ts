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

export const updateUser = async (user: UpdateUserInput): Promise<User> => {
  const expression: Array<string> = []
  const attributeValues = {}
  const attributeNames = {}
  for (const property in user) {
    if (typeof user[property] !== 'undefined') {
      switch (property) {
        case 'city':
          expression.push('city = :c')
          attributeValues[':c'] = user.city
          break
        case 'countryCode':
          expression.push('countryCode = :cc')
          attributeValues[':cc'] = user.countryCode
          break
        case 'firstName':
          expression.push('firstName = :f')
          attributeValues[':f'] = user.firstName
          break
        case 'lastName':
          expression.push('lastName = :l')
          attributeValues[':l'] = user.lastName
          break
        case 'primaryPhone':
          expression.push('primaryPhone = :p')
          attributeValues[':p'] = user.primaryPhone
          break
        case 'state':
          expression.push('#st = :st')
          attributeNames['#st'] = 'state'
          attributeValues[':st'] = user.state
          break
        case 'streetAddress':
          expression.push('streetAddress = :sa')
          attributeValues[':sa'] = user.streetAddress
          break
        case 'zipCode':
          expression.push('zipCode = :z')
          attributeValues[':z'] = user.zipCode
          break
        default:
          break
      }
    }
  }
  const params = {
    TableName: USERS_TABLE,
    Key: {
      email: user.email
    },
    UpdateExpression: `set ${expression.join(', ')}`,
    ExpressionAttributeValues: attributeValues,
    ExpressionAttributeNames: Object.keys(attributeNames).length > 0 ? attributeNames : undefined,
    ReturnValues: 'ALL_NEW'
  }
  const data = await client.update(params).promise()
  return data.Attributes as User
}

export const changePassword = async (email: string, password: string): Promise<User> => {
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
    ReturnValues: 'ALL_NEW'
  }
  const data = await client.update(params).promise()
  return data.Attributes as User
}
