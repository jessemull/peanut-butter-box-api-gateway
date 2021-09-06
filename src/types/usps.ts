export interface Address {
  Address1: string;
  Address2: string;
  City: string;
  State: string;
  Zip5: string;
}

export interface ValidatedAddress {
  Address1?: string;
  Address2: string;
  City: string;
  State: string;
  Zip5: number;
  Zip4: number;
  DeliveryPoint: number;
  CarrierRoute: string;
  Footnotes: string;
  DPVConfirmation: string;
  DPVCMRA: string;
  DPVFootnotes: string;
  Business: string;
  CentralDeliveryPoint: string;
  Vacant: string;
}

export interface AddressValidationResponse {
  AddressValidateResponse: {
    Address: ValidatedAddress;
  }
}
