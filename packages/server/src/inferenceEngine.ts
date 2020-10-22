import { Injectable } from '@nestjs/common';
import { AdapterName } from './adapters/adapter';
import { Context } from './common';

@Injectable()
export class InferenceEngine {
  inferService(context: Context): AdapterName {
    return context.language?.includes('pt-BR')
      ? AdapterName.Google
      : AdapterName.Google;
  }
}
