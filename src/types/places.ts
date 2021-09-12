export interface GetAddressesInput {
  input: string;
}

export interface GetCitiesInput {
  input: string;
}

export interface GetStatesInput {
  input: string;
}

export interface Term {
  offset: number;
  value: string;
}

export interface Prediction {
  description: string;
  place_id: string;
  terms: Array<Term>;
}

export interface AutocompleteResponse {
  data: {
    predictions: Array<Prediction>;
  }
}

export interface AddressSuggestion {
  label: string;
  value: string;
}

export interface CitySuggestion {
  label: string;
  value: {
    countryCode: string;
    city: string;
    region: string;
  }
}

export interface StateSuggestion {
  label: string;
  value: {
    countryCode: string;
    region: string;
  };
}

export interface GetDetailsInput {
  placeId: string;
}

export interface Details {
  city?: string;
  countryCode?: string;
  number?: string;
  state?: string;
  street?: string;
  zipCode?: string;
}

export interface AddressComponent {
  long_name: string;
  short_name: string;
  types: Array<string>;
}

export interface GetDetailsResponse {
  data: {
    result: {
      address_components: Array<AddressComponent>;
    }
  }
}
