import axios from 'axios'
import { mocked } from 'ts-jest/utils'
import { verifyAddress } from './usps'

jest.mock('axios')

const { get } = mocked(axios, true)

process.env.USPS_ID_SECRET_NAME = 'USPS_ID'

describe('usps service', () => {
  it('should validate and scrub address', async () => {
    const address = {
      Address1: 'SUITE 5',
      Address2: '12345 Fake St',
      City: 'Portland',
      State: 'OR',
      Zip5: '12345'
    }
    const expected = {
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
    const verifiedAddress = `
      <?xml version="1.0" encoding="UTF-8"?>
      <AddressValidateResponse>
        <Address ID="0">
          <Address2>6605 N CAMPBELL AVE</Address2>
          <City>PORTLAND</City>
          <State>OR</State>
          <Zip5>97217</Zip5>
          <Zip4>4959</Zip4>
          <DeliveryPoint>05</DeliveryPoint>
          <CarrierRoute>C038</CarrierRoute>
          <Footnotes>L</Footnotes>
          <DPVConfirmation>Y</DPVConfirmation>
          <DPVCMRA>N</DPVCMRA>
          <DPVFootnotes>AABB</DPVFootnotes>
          <Business>N</Business>
          <CentralDeliveryPoint>N</CentralDeliveryPoint>
          <Vacant>N</Vacant>
        </Address>
      </AddressValidateResponse>
    `
    const url = 'https://secure.shippingapis.com/ShippingAPI.dll?API=Verify&XML=<AddressValidateRequest><Revision>1</Revision><Address ID="0"><Address1>SUITE 5</Address1><Address2>12345 Fake St</Address2><City>Portland</City><State>OR</State><Zip5>12345</Zip5><Zip4/></Address></AddressValidateRequest>'
    get.mockImplementation(() => Promise.resolve({ data: verifiedAddress }) as any)
    const response = await verifyAddress(address)
    expect(get).toHaveBeenCalledWith(url)
    expect(response).toEqual(expected)
  })
})
