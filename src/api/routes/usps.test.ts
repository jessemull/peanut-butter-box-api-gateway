import bodyParser from 'body-parser'
import express, { Application } from 'express'
import supertest from 'supertest'
import { mocked } from 'ts-jest/utils'
import routes from '..'
import { USPSService } from '../../services'

jest.mock('../../services')

const { verifyAddress } = mocked(USPSService)

const getApp = (): Application => {
  const app = express()
  app.use(bodyParser.json({ strict: false }))
  app.use(routes())
  return app
}

describe('/usps', () => {
  let app: Application
  beforeAll(() => {
    app = getApp()
  })
  it('POST /verify verifies and returns scrubbed address', async () => {
    const address = {
      Address1: 'SUITE 5',
      Address2: '12345 Fake St',
      City: 'Portland',
      State: 'OR',
      Zip5: 12345
    }
    const verifiedAddress = {
      Address2: '6605 N CAMPBELL AVE',
      City: 'PORTLAND',
      State: 'OR',
      Zip5: 97217,
      Zip4: 4959,
      DeliveryPoint: 5,
      CarrierRoute: 'C038',
      Footnotes: 'L',
      DPVConfirmation: 'Y',
      DPVCMRA: 'N',
      DPVFootnotes: 'AABB',
      Business: 'N',
      CentralDeliveryPoint: 'N',
      Vacant: 'N'
    }
    verifyAddress.mockResolvedValueOnce(verifiedAddress)
    const response = await supertest(app)
      .post('/usps/verify')
      .send(address)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(200)
    expect(response.body).toEqual(verifiedAddress)
    expect(verifyAddress).toHaveBeenCalledWith(address)
  })
  it('POST catches errors and returns 500', async () => {
    const address = {
      Address1: 'SUITE 5',
      Address2: '12345 Fake St',
      City: 'Portland',
      State: 'OR',
      Zip5: 12345
    }
    verifyAddress.mockImplementationOnce(() => {
      throw new Error()
    })
    const response = await supertest(app)
      .post('/usps/verify')
      .send(address)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(500)
    expect(response.body).toEqual({ error: 'Could not validate address!' })
  })
})
