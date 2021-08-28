import client from '../lib/dynamo'
import { Product } from '../types'

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE || 'users-table-dev'

export const createProduct = async ({ description, name, price, productId, title }: Product): Promise<Product> => {
  const params = {
    TableName: PRODUCTS_TABLE,
    Item: {
      description,
      name,
      price,
      productId,
      title
    },
    ReturnValues: 'ALL_NEW'
  }
  const data = await client.put(params).promise()
  return data as unknown as Product
}

export const deleteProduct = async (productId: string): Promise<void> => {
  const params = {
    TableName: PRODUCTS_TABLE,
    Key: {
      productId
    }
  }
  await client.delete(params).promise()
}

export const getProduct = async (email: string): Promise<Product | null> => {
  const params = {
    TableName: PRODUCTS_TABLE,
    Key: {
      email
    }
  }
  const data = await client.get(params).promise()
  return data.Item as Product
}

export const getProducts = async (): Promise<Array<Product> | null> => {
  const params = {
    TableName: PRODUCTS_TABLE
  }
  const data = await client.scan(params).promise()
  return data.Items as Array<Product>
}

export const updateProduct = async ({ description, name, price, productId, title }: Product): Promise<Product> => {
  const params = {
    TableName: PRODUCTS_TABLE,
    Key: {
      productId
    },
    UpdateExpression: 'set description = :d, name = :n, price = :p, productId = :i, title = :t',
    ExpressionAttributeValues: {
      ':d': description,
      ':n': name,
      ':p': price,
      ':i': productId,
      ':t': title
    },
    ReturnValues: 'ALL_NEW'
  }
  const data = await client.update(params).promise()
  return data as unknown as Product
}
