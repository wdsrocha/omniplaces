import {
  AddressType,
  Client,
  GeocodingAddressComponentType,
} from '@googlemaps/google-maps-services-js';
import { Injectable } from '@nestjs/common';
import { AdapterName } from './adapters/adapter';
import { Context } from './common';

@Injectable()
export class InferenceEngine {
  private client: Client;
  private key: string;

  constructor() {
    this.client = new Client();
  }

  async inferService(context: Context): Promise<AdapterName> {
    const [latitude, longitude] = context.geolocation.split(',').map(k => +k);

    try {
      const response = await this.client.reverseGeocode({
        params: {
          key: this.key,
          latlng: {
            latitude,
            longitude,
          },
        },
      });
      function getValue(
        type: AddressType | GeocodingAddressComponentType,
        isLongName = true,
      ) {
        return response.data.results?.[0]?.address_components.find(
          addressComponent => addressComponent.types?.includes(type),
        )?.[isLongName ? 'long_name' : 'short_name'];
      }

      console.log(getValue(AddressType.country));
      return AdapterName.Baidu;
    } catch {
      if (
        30 < latitude &&
        latitude < 35 &&
        110 < longitude &&
        longitude < 130
      ) {
        return AdapterName.Baidu;
      } else {
        return AdapterName.Google;
      }
    }
  }
}
