import bodyParser from 'body-parser'
import express, { Application } from 'express'
import supertest from 'supertest'
import { mocked } from 'ts-jest/utils'
import routes from '..'
import { ProductsService } from '../../services'

jest.mock('../../services')

const { createProduct, deleteProduct, getProduct, getProducts, updateProduct } = mocked(ProductsService)

const getApp = (): Application => {
  const app = express()
  app.use(bodyParser.json({ strict: false }))
  app.use(routes())
  return app
}

describe('/users', () => {
  let app: Application
  beforeAll(() => {
    app = getApp()
  })
  it('GET returns all products', async () => {
    const products = [{
      description: 'description',
      examples: 'examples',
      name: 'name',
      price: 100.12,
      productId: 'productId',
      title: 'title'
    }]
    getProducts.mockResolvedValueOnce(products)
    const response = await supertest(app)
      .get('/products')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(200)
    expect(response.body).toEqual(products)
    expect(getProducts).toHaveBeenCalled()
  })
  it('GET catches errors and returns 500', async () => {
    getProducts.mockImplementationOnce(() => {
      throw new Error()
    })
    const response = await supertest(app)
      .get('/products')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(500)
    expect(response.body).toEqual({ error: 'Could not fetch products!' })
  })
  it('POST creates a new product', async () => {
    const product = {
      description: 'description',
      examples: 'examples',
      name: 'name',
      price: 100.12,
      productId: 'productId',
      title: 'title'
    }
    createProduct.mockResolvedValueOnce(product)
    const response = await supertest(app)
      .post('/products')
      .send(product)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(200)
    expect(response.body).toEqual(product)
    expect(createProduct).toHaveBeenCalledWith(product)
    expect(getProduct).toHaveBeenCalledWith(product.productId)
  })
  it('POST returns conflict if the product already exists', async () => {
    const product = {
      description: 'description',
      examples: 'examples',
      name: 'name',
      price: 100.12,
      productId: 'productId',
      title: 'title'
    }
    getProduct.mockResolvedValueOnce(product)
    const response = await supertest(app)
      .post('/products')
      .send(product)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(409)
    expect(response.body).toEqual({ error: 'This product already exists!' })
    expect(getProduct).toHaveBeenCalledWith(product.productId)
  })
  it('POST catches errors and returns 500', async () => {
    const product = {
      description: 'description',
      examples: 'examples',
      name: 'name',
      price: 100.12,
      productId: 'productId',
      title: 'title'
    }
    createProduct.mockImplementationOnce(() => {
      throw new Error()
    })
    const response = await supertest(app)
      .post('/products')
      .send(product)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(500)
    expect(response.body).toEqual({ error: 'Product creation failed!' })
    expect(getProduct).toHaveBeenCalledWith(product.productId)
  })
  it('PUT updates a product', async () => {
    const product = {
      description: 'description',
      examples: 'examples',
      name: 'name',
      price: 100.12,
      productId: 'productId',
      title: 'title'
    }
    updateProduct.mockResolvedValueOnce(product)
    getProduct.mockResolvedValueOnce(product)
    const response = await supertest(app)
      .put('/products/productId')
      .send(product)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(200)
    expect(response.body).toEqual(product)
    expect(updateProduct).toHaveBeenCalledWith(product)
    expect(getProduct).toHaveBeenCalledWith('productId')
  })
  it('PUT returns 404 if the product does not exist', async () => {
    const product = {
      description: 'description',
      examples: 'examples',
      name: 'name',
      price: 100.12,
      title: 'title'
    }
    getProduct.mockResolvedValueOnce(null)
    const response = await supertest(app)
      .put('/products/productId')
      .send(product)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(404)
    expect(response.body).toEqual({ error: 'Product does not exist!' })
    expect(getProduct).toHaveBeenCalledWith('productId')
  })
  it('PUT catches errors and returns 500', async () => {
    const product = {
      description: 'description',
      examples: 'examples',
      name: 'name',
      productId: 'productId',
      price: 100.12,
      title: 'title'
    }
    updateProduct.mockImplementationOnce(() => {
      throw new Error()
    })
    getProduct.mockResolvedValueOnce(product)
    const response = await supertest(app)
      .put('/products/productId')
      .send(product)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(500)
    expect(response.body).toEqual({ error: 'Product update failed!' })
    expect(getProduct).toHaveBeenCalledWith('productId')
  })
  it('DELETE deletes a product', async () => {
    const product = {
      description: 'description',
      examples: 'examples',
      name: 'name',
      price: 100.12,
      productId: 'productId',
      title: 'title'
    }
    getProduct.mockResolvedValueOnce(product)
    await supertest(app)
      .delete('/products/productId')
      .send(product)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(204)
    expect(deleteProduct).toHaveBeenCalledWith('productId')
    expect(getProduct).toHaveBeenCalledWith('productId')
  })
  it('DELETE returns 404 if the product does not exist', async () => {
    const product = {
      description: 'description',
      examples: 'examples',
      name: 'name',
      price: 100.12,
      title: 'title'
    }
    getProduct.mockResolvedValueOnce(null)
    const response = await supertest(app)
      .delete('/products/productId')
      .send(product)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(404)
    expect(response.body).toEqual({ error: 'Product does not exist!' })
    expect(getProduct).toHaveBeenCalledWith('productId')
  })
  it('DELETE catches errors and returns 500', async () => {
    const product = {
      description: 'description',
      examples: 'examples',
      name: 'name',
      productId: 'productId',
      price: 100.12,
      title: 'title'
    }
    deleteProduct.mockImplementationOnce(() => {
      throw new Error()
    })
    getProduct.mockResolvedValueOnce(product)
    const response = await supertest(app)
      .delete('/products/productId')
      .send(product)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(500)
    expect(response.body).toEqual({ error: 'Failed to delete product!' })
    expect(getProduct).toHaveBeenCalledWith('productId')
  })
})
