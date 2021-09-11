import axios from 'axios'
import * as secrets from '../lib/secrets-manager'
import { mocked } from 'ts-jest/utils'
import { getAddresses, getCities, getDetails, getStates } from './places'

jest.mock('axios')

jest.mock('../lib/secrets-manager')

const { get } = mocked(axios, true)
const { getSecret } = mocked(secrets, true)

describe('places service', () => {
  it('should auto-complete addresses', async () => {
    const input = 'address'
    const response = {
      predictions: [{
        description: 'description',
        place_id: 'place_id'
      }]
    }
    get.mockImplementationOnce(() => Promise.resolve({ data: response }) as any)
    getSecret.mockImplementationOnce(() => Promise.resolve('apikey') as any)
    const suggestions = await getAddresses({ input })
    expect(suggestions).toEqual([{ label: 'description', value: 'place_id' }])
    expect(get).toHaveBeenLastCalledWith('https://maps.googleapis.com/maps/api/place/autocomplete/json?input=address&types=address&key=apikey')
    expect(getSecret).toHaveBeenCalledWith('GOOGLE_API_KEY_SECRET_NAME')
  })
  it('should auto-complete cities', async () => {
    const input = 'city'
    const response = {
      predictions: [{
        description: 'description',
        terms: [{
          value: 'term1'
        }, {
          value: 'term2'
        }]
      }]
    }
    get.mockImplementationOnce(() => Promise.resolve({ data: response }) as any)
    getSecret.mockImplementationOnce(() => Promise.resolve('apikey') as any)
    const suggestions = await getCities({ input })
    expect(suggestions).toEqual([{ label: 'description', value: { city: 'term1', state: 'term2' } }])
    expect(get).toHaveBeenLastCalledWith('https://maps.googleapis.com/maps/api/place/autocomplete/json?input=city&types=(cities)&key=apikey')
    expect(getSecret).toHaveBeenCalledWith('GOOGLE_API_KEY_SECRET_NAME')
  })
  it('should auto-complete states', () => {
    const input = 'H'
    getSecret.mockImplementationOnce(() => Promise.resolve('apikey') as any)
    const suggestions = getStates({ input })
    expect(suggestions).toEqual([{ label: 'HI', value: 'HI' }])
  })
  it('should return place details', async () => {
    const placeId = 'placeId'
    const response = {
      result: {
        address_components: [{
          long_name: 'number',
          types: ['street_number']
        }, {
          long_name: 'city',
          types: ['locality']
        }, {
          short_name: 'state',
          types: ['administrative_area_level_1']
        }, {
          long_name: 'address',
          types: ['route']
        }, {
          long_name: '12345',
          types: ['postal_code']
        }, {
          types: ['invalid']
        }]
      }
    }
    get.mockImplementationOnce(() => Promise.resolve({ data: response }) as any)
    getSecret.mockImplementationOnce(() => Promise.resolve('apikey') as any)
    const details = await getDetails({ placeId })
    expect(details).toEqual({ city: 'city', number: 'number', state: 'state', street: 'address', zipCode: '12345' })
    expect(get).toHaveBeenLastCalledWith('https://maps.googleapis.com/maps/api/place/details/json?place_id=placeId&key=apikey&fields=address_components')
    expect(getSecret).toHaveBeenCalledWith('GOOGLE_API_KEY_SECRET_NAME')
  })
})
