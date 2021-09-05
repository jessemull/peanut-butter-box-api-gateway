import axios from 'axios'
import get from 'lodash.get'
import * as js2xml from 'xml-js'
import * as xml2js from 'fast-xml-parser'
import { getSecret } from '../lib/secrets-manager'
import { Address, Addressvalidation } from '../types'

export const verifyAddress = async ({ Address1, Address2, City, State, Zip5 }: Address): Promise<Address> => {
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
  const url = `https://secure.shippingapis.com/ShippingAPI.dll?API=Verify&XML=${scrubbedXML}`
  const response = await axios.get(url)
  const verifiedAddress = xml2js.parse(response.data) as Addressvalidation
  return get(verifiedAddress, 'AddressValidateResponse.Address', {}) as Address
}
