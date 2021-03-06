import axios from 'axios'
import get from 'lodash.get'
import * as js2xml from 'xml-js'
import * as xml2js from 'fast-xml-parser'
import { getSecret } from '../lib/secrets-manager'
import { Address, AddressValidationResponse, ValidatedAddress } from '../types'

const uspsURL = process.env.USPS_URL as string

export const verifyAddress = async ({ Address1, Address2, City, State, Zip5 }: Address): Promise<ValidatedAddress> => {
  const USPS_ID = await getSecret(process.env.USPS_ID_SECRET_NAME as string)
  const json = {
    AddressValidateRequest: {
      _attributes: {
        USERID: USPS_ID
      },
      Revision: 1,
      Address: {
        _attributes: {
          ID: 0
        },
        Address1,
        Address2,
        City,
        State,
        Zip5,
        Zip4: ''
      }
    }
  }
  const xml = js2xml.js2xml(json, { compact: true })
  const scrubbedXML = xml.replace(/\\"/gi, '')
  const url = `${uspsURL}/ShippingAPI.dll?API=Verify&XML=${scrubbedXML}`
  const response = await axios.get(url)
  const verifiedAddress = xml2js.parse(response.data) as AddressValidationResponse
  return get(verifiedAddress, 'AddressValidateResponse.Address', {}) as ValidatedAddress
}
