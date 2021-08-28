import { mocked } from 'ts-jest/utils'
import client from '../lib/dynamo'
import { createProduct, deleteProduct, getProduct, getProducts, updateProduct } from './products'

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE || 'products-table-dev'

jest.mock('../lib/dynamo')

const { delete: dynamoDelete, get, update, scan } = mocked(client)

describe('products service', () => {
  it('should create a product', async () => {
    const product = {
      description: 'description',
      name: 'name',
      price: 100.12,
      productId: 'productId',
      title: 'title'
    }
    const params = {
      TableName: PRODUCTS_TABLE,
      Key: {
        productId: product.productId
      },
      UpdateExpression: 'set description = :d, #nm = :n, price = :p, title = :t',
      ExpressionAttributeValues: {
        ':d': product.description,
        ':n': product.name,
        ':p': product.price,
        ':t': product.title
      },
      ExpressionAttributeNames: {
        '#nm': 'name'
      },
      ReturnValues: 'ALL_NEW'
    }
    update.mockImplementationOnce(() => ({ promise: () => Promise.resolve({ Attributes: product }) } as any))
    const response = await createProduct(product)
    expect(response).toEqual(product)
    expect(update).toHaveBeenLastCalledWith(params)
  })
  it('should delete a product', async () => {
    const productId = 'productId'
    const params = {
      TableName: PRODUCTS_TABLE,
      Key: {
        productId
      }
    }
    dynamoDelete.mockImplementationOnce(() => ({ promise: () => Promise.resolve() } as any))
    await deleteProduct(productId)
    expect(dynamoDelete).toHaveBeenLastCalledWith(params)
  })
  it('should get a product', async () => {
    const product = {
      description: 'description',
      name: 'name',
      price: 100.12,
      productId: 'productId',
      title: 'title'
    }
    const params = {
      TableName: PRODUCTS_TABLE,
      Key: {
        productId: product.productId
      }
    }
    get.mockImplementationOnce(() => ({ promise: () => Promise.resolve({ Item: product }) } as any))
    const response = await getProduct(product.productId)
    expect(response).toEqual(product)
    expect(get).toHaveBeenLastCalledWith(params)
  })
  it('should get products', async () => {
    const products = [{
      description: 'description',
      name: 'name',
      price: 100.12,
      productId: 'productId',
      title: 'title'
    }]
    const params = {
      TableName: PRODUCTS_TABLE
    }
    scan.mockImplementationOnce(() => ({ promise: () => Promise.resolve({ Items: products }) } as any))
    const response = await getProducts()
    expect(response).toEqual(products)
    expect(scan).toHaveBeenLastCalledWith(params)
  })
  it('should update a product', async () => {
    const product = {
      description: 'description',
      name: 'name',
      price: 100.12,
      productId: 'productId',
      title: 'title'
    }
    const params = {
      TableName: PRODUCTS_TABLE,
      Key: {
        productId: product.productId
      },
      UpdateExpression: 'set description = :d, #nm = :n, price = :p, title = :t',
      ExpressionAttributeValues: {
        ':d': product.description,
        ':n': product.name,
        ':p': product.price,
        ':t': product.title
      },
      ExpressionAttributeNames: {
        '#nm': 'name'
      },
      ReturnValues: 'ALL_NEW'
    }
    update.mockImplementationOnce(() => ({ promise: () => Promise.resolve({ Attributes: product }) } as any))
    const response = await updateProduct(product)
    expect(response).toEqual(product)
    expect(update).toHaveBeenLastCalledWith(params)
  })
})
