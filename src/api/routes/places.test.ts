import bodyParser from 'body-parser'
import express, { Application } from 'express'
import supertest from 'supertest'
import { mocked } from 'ts-jest/utils'
import routes from '..'
import { PlacesService } from '../../services'

jest.mock('../../services')

const { getAddresses, getCities, getDetails, getStates } = mocked(PlacesService)

const getApp = (): Application => {
  const app = express()
  app.use(bodyParser.json({ strict: false }))
  app.use(routes())
  return app
}

describe('/places', () => {
  let app: Application
  beforeAll(() => {
    app = getApp()
  })
  it('GET /autocomplete/address autocompletes an address', async () => {
    const addresses = [{
      label: 'address',
      value: 'placeId'
    }]
    getAddresses.mockResolvedValueOnce(addresses)
    const response = await supertest(app)
      .get('/places/autocomplete/address?input=address')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(200)
    expect(response.body).toEqual(addresses)
    expect(getAddresses).toHaveBeenCalledWith({ input: 'address' })
  })
  it('GET /autocomplete/address catches errors and returns 500', async () => {
    getAddresses.mockImplementationOnce(() => {
      throw new Error()
    })
    const response = await supertest(app)
      .get('/places/autocomplete/address?input=address')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(500)
    expect(response.body).toEqual({ error: 'Could not auto-complete address!' })
  })
  it('GET /autocomplete/city autocompletes a city', async () => {
    const cities = [{
      label: 'city, state',
      value: {
        city: 'city',
        state: 'state'
      }
    }]
    getCities.mockResolvedValueOnce(cities)
    const response = await supertest(app)
      .get('/places/autocomplete/city?input=city')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(200)
    expect(response.body).toEqual(cities)
    expect(getCities).toHaveBeenCalledWith({ input: 'city' })
  })
  it('GET /autocomplete/city catches errors and returns 500', async () => {
    getCities.mockImplementationOnce(() => {
      throw new Error()
    })
    const response = await supertest(app)
      .get('/places/autocomplete/city?input=city')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(500)
    expect(response.body).toEqual({ error: 'Could not auto-complete city!' })
  })
  it('GET /autocomplete/state autocompletes a state', async () => {
    const states = [{
      label: 'state',
      value: 'state'
    }]
    getStates.mockReturnValue(states)
    const response = await supertest(app)
      .get('/places/autocomplete/state?input=state')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(200)
    expect(response.body).toEqual(states)
    expect(getStates).toHaveBeenCalledWith({ input: 'state' })
  })
  it('GET /autocomplete/state catches errors and returns 500', async () => {
    getStates.mockImplementationOnce(() => {
      throw new Error()
    })
    const response = await supertest(app)
      .get('/places/autocomplete/state?input=state')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(500)
    expect(response.body).toEqual({ error: 'Could not auto-complete state!' })
  })
  it('GET /details should return place details', async () => {
    const details = {
      city: 'city',
      number: 'number',
      state: 'state',
      street: 'street',
      zipCode: '12345'
    }
    getDetails.mockResolvedValueOnce(details)
    const response = await supertest(app)
      .get('/places/details?placeId=placeId')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(200)
    expect(response.body).toEqual(details)
    expect(getDetails).toHaveBeenCalledWith({ placeId: 'placeId' })
  })
  it('GET /details catches errors and returns 500', async () => {
    getDetails.mockImplementationOnce(() => {
      throw new Error()
    })
    const response = await supertest(app)
      .get('/places/details?placeId=placeId')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(500)
    expect(response.body).toEqual({ error: 'Could not get place details!' })
  })
})
