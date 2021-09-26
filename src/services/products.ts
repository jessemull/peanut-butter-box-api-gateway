import client from '../lib/dynamo'
import { Product } from '../types'

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE || 'products-table-dev'

export const createProduct = async ({ description, examples, name, price, productId, title }: Product): Promise<Product> => {
  const params = {
    TableName: PRODUCTS_TABLE,
    Key: {
      productId
    },
    UpdateExpression: 'set description = :d, examples = :e, #nm = :n, price = :p, title = :t',
    ExpressionAttributeValues: {
      ':d': description,
      ':e': examples,
      ':n': name,
      ':p': price,
      ':t': title
    },
    ExpressionAttributeNames: {
      '#nm': 'name'
    },
    ReturnValues: 'ALL_NEW'
  }
  const data = await client.update(params).promise()
  return data.Attributes as Product
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

export const getProduct = async (productId: string): Promise<Product | null> => {
  const params = {
    TableName: PRODUCTS_TABLE,
    Key: {
      productId
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

export const updateProduct = async ({ description, examples, name, price, productId, title }: Product): Promise<Product> => {
  const params = {
    TableName: PRODUCTS_TABLE,
    Key: {
      productId
    },
    UpdateExpression: 'set description = :d, examples = :e, #nm = :n, price = :p, title = :t',
    ExpressionAttributeValues: {
      ':d': description,
      ':e': examples,
      ':n': name,
      ':p': price,
      ':t': title
    },
    ExpressionAttributeNames: {
      '#nm': 'name'
    },
    ReturnValues: 'ALL_NEW'
  }
  const data = await client.update(params).promise()
  return data.Attributes as Product
}
