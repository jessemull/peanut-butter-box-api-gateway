import { Router, Request, Response } from 'express'
import logger from '../../lib/logger'
import { ProductsService } from '../../services'
import { Product } from '../../types'

const route: Router = Router()

export default (app: Router): void => {
  app.use('/products', route)

  route.get('/', async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const products = await ProductsService.getProducts()
      res.json(products)
    } catch (error) {
      logger.error(error)
      res.status(500).json({ error: 'Could not fetch products' })
    }
  })

  route.post('/', async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { description, name, price, productId, title } = req.body as Product
      const existingProduct = await ProductsService.getProduct(productId)
      if (existingProduct) {
        return res.status(409).json({ error: 'This product already exists!' })
      }
      const product = await ProductsService.createProduct({ description, name, price, productId, title })
      res.json(product)
    } catch (error) {
      logger.error(error)
      res.status(500).json({ error: 'Product creation failed!' })
    }
  })

  route.put('/:productId', async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { description, name, price, title } = req.body as Product
      const { productId } = req.params
      const existingProduct = await ProductsService.getProduct(productId)
      if (!existingProduct) {
        return res.status(404).json({ error: 'Product does not exist!' })
      }
      const product = await ProductsService.updateProduct({ description, name, price, productId, title })
      res.json(product)
    } catch (error) {
      logger.error(error)
      res.status(500).json({ error: 'Product update failed!' })
    }
  })

  route.delete('/:productId', async (req: Request, res: Response): Promise<void | Response> => {
    const { productId } = req.params
    try {
      const existingProduct = await ProductsService.getProduct(productId)
      if (!existingProduct) {
        return res.status(404).json({ error: 'Product does not exist!' })
      }
      await ProductsService.deleteProduct(productId)
      res.status(204).send()
    } catch (error) {
      logger.error(error)
      res.status(500).json({ error: 'Failed to delete product!' })
    }
  })
}
