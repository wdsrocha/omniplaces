import { Context } from 'src/common';

export enum AdapterName {
  Google,
  Here,
  Baidu,
}

export class MatchInterval {
  offset: number;
  length: number;
}

export class AddressSuggestion {
  id: string;
  description: string;
  mainText: string;
  mainTextMatchInterval: MatchInterval;
  secondaryText: string;
}

export class Address {
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export class SuggestAddressesResponse {
  suggestions: AddressSuggestion[];
}

export interface Adapter {
  name: AdapterName;

  suggestAddresses(
    query: string,
    options?: any,
  ): Promise<SuggestAddressesResponse>;

  lookup(id: string, options?: any): Promise<Address>;
}
