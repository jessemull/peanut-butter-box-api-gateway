
import fs from 'fs'
import { Request, Response, Router } from 'express'

const json = JSON.parse(fs.readFileSync('./package.json', 'utf8')) as { version: string }
const version = json.version

const route = Router()

export default (app: Router): void => {
  app.use('/healthcheck', route)
  route.get('/', function (req: Request, res: Response): void {
    res.json(version)
  })
}
