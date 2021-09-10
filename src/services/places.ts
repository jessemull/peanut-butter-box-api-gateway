import axios from 'axios'
import { states } from '../constants'
import { getSecret } from '../lib/secrets-manager'
import { AddressComponent, AddressSuggestion, AutocompleteResponse, CitySuggestion, Details, GetAddressesInput, GetCitiesInput, GetDetailsInput, GetDetailsResponse, GetStatesInput, Prediction, StateSuggestion } from '../types'

const googleURL = process.env.GOOGLE_API_URL as string

export const getAddresses = async ({ input }: GetAddressesInput): Promise<Array<AddressSuggestion>> => {
  const GOOGLE_API_KEY = await getSecret(process.env.GOOGLE_API_KEY_SECRET_NAME as string)
  const response = await axios.get(`${googleURL}/maps/api/place/autocomplete/json?input=${input}&types=address&key=${GOOGLE_API_KEY as string}`) as unknown as AutocompleteResponse
  return response.data.predictions.map(({ description, place_id }: Prediction): AddressSuggestion => ({ label: description, value: place_id }))
}

export const getCities = async ({ input }: GetCitiesInput): Promise<Array<CitySuggestion>> => {
  const GOOGLE_API_KEY = await getSecret(process.env.GOOGLE_API_KEY_SECRET_NAME as string)
  const response = await axios.get(`${googleURL}/maps/api/place/autocomplete/json?input=${input}&types=(cities)&key=${GOOGLE_API_KEY as string}`) as unknown as AutocompleteResponse
  return response.data.predictions.map(({ description, terms }: Prediction): CitySuggestion => ({ label: description, value: { city: terms[0].value, state: terms[1].value } }))
}

export const makeDetails = (address_components: Array<AddressComponent>): Details => {
  const details: Details = {}
  for (let i = 0; i < address_components.length; i++) {
    switch (address_components[i].types[0]) {
      case 'street_number':
        details.number = address_components[i].long_name
        break
      case 'locality':
        details.city = address_components[i].long_name
        break
      case 'administrative_area_level_1':
        details.state = address_components[i].short_name
        break
      case 'route':
        details.street = address_components[i].long_name
        break
      case 'postal_code':
        details.zipCode = address_components[i].long_name
        break
      default:
        break
    }
  }
  return details
}

export const getDetails = async ({ placeId }: GetDetailsInput): Promise<Details> => {
  const GOOGLE_API_KEY = await getSecret(process.env.GOOGLE_API_KEY_SECRET_NAME as string)
  const response = await axios.get(`${googleURL}/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_API_KEY as string}&fields=address_components`) as unknown as GetDetailsResponse
  const details = makeDetails(response.data.result.address_components)
  return details
}

export const getStates = ({ input }: GetStatesInput): Array<StateSuggestion> => states.filter(state => state.label.startsWith(input))
