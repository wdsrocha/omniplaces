import { Injectable, Logger } from '@nestjs/common';
import {
  Adapter,
  AdapterName,
  Address,
  AddressSuggestion,
  SuggestAddressesResponse,
} from './adapter';
import {
  AddressType,
  Client,
  GeocodingAddressComponentType,
  Language,
  PlaceAutocompleteRequest,
  PlaceAutocompleteType,
  PlaceDetailsRequest,
  Status,
} from '@googlemaps/google-maps-services-js';

@Injectable()
export class BaiduAdapter implements Adapter {
  name = AdapterName.Baidu;
  private client: Client;
  private key: string;

  constructor() {
    this.client = new Client();
    this.key = 'AIzaSyBVHDbE_WCEqZT9SGYJqG-CLHsekup6-N8';
  }

  async suggestAddresses(
    query: string,
    options: { language: string },
  ): Promise<SuggestAddressesResponse> {
    const { language } = options;

    const request: PlaceAutocompleteRequest = {
      params: {
        input: query,
        language,
        types: PlaceAutocompleteType.address,
        key: this.key,
      },
      timeout: 1000,
    };

    const response = await this.client.placeAutocomplete(request);

    if (response?.statusText !== Status.OK) {
      Logger.error(response);
      return { suggestions: [] };
    }

    return {
      suggestions: response.data.predictions.map(
        ({
          description,
          structured_formatting: {
            main_text,
            main_text_matched_substrings,
            secondary_text,
          },
          place_id,
        }) => {
          return {
            description,
            mainText: main_text,
            mainTextMatchInterval: main_text_matched_substrings[0],
            secondaryText: secondary_text,
            id: place_id,
          } as AddressSuggestion;
        },
      ),
    };
  }

  async lookup(id: string, options: { language: string }): Promise<Address> {
    const { language } = options;

    const request: PlaceDetailsRequest = {
      params: {
        place_id: id,
        language: language as Language,
        key: this.key,
      },
      timeout: 1000,
    };

    const response = await this.client.placeDetails(request);

    if (response.statusText !== Status.OK) {
      Logger.error(response);
      return {};
    }

    function getValue(
      type: AddressType | GeocodingAddressComponentType,
      isLongName = true,
    ) {
      return response.data.result?.address_components.find(addressComponent =>
        addressComponent.types?.includes(type),
      )?.[isLongName ? 'long_name' : 'short_name'];
    }

    return {
      street: getValue(AddressType.route),
      number: getValue(GeocodingAddressComponentType.street_number),
      neighborhood: getValue(AddressType.neighborhood),
      city:
        getValue(AddressType.administrative_area_level_2) ||
        getValue(AddressType.locality),
      state: getValue(AddressType.administrative_area_level_1, false),
      country: getValue(AddressType.country, false),
      postalCode: getValue(AddressType.postal_code),
    };
  }
}
