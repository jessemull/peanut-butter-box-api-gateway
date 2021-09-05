export interface Address {
  Address1: string;
  Address2: string;
  City: string;
  State: string;
  Zip5: string;
}

export interface Addressvalidation {
  AddressValidateResponse: {
    Address: Address;
  }
}
