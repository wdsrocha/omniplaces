import {
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { AdapterName } from './adapters/adapter';
import { GoogleAdapter } from './adapters/GoogleAdapter';
import { InferenceEngine } from './inferenceEngine';

@Injectable()
export class ContextManager {
  constructor(
    private readonly inferenceEngine: InferenceEngine,
    private readonly googleAdapter: GoogleAdapter,
  ) {}

  async suggest(query: string, language?: string, geolocation?: string) {
    const serviceName = this.inferenceEngine.inferService({
      language,
      geolocation,
    });

    switch (serviceName) {
      case AdapterName.Google:
        return await this.googleAdapter.suggestAddresses(query, { language });
      case AdapterName.Here:
        throw new NotImplementedException();
      default:
        throw new NotFoundException(`Can't find '${serviceName}' service.`);
    }
  }

  async lookup(id: string, language?: string, geolocation?: string) {
    const serviceName = this.inferenceEngine.inferService({
      language,
      geolocation,
    });

    switch (serviceName) {
      case AdapterName.Google:
        return await this.googleAdapter.lookup(id, { language });
      case AdapterName.Here:
        throw new NotImplementedException();
      default:
        throw new NotFoundException(`Can't find '${serviceName}' service.`);
    }
  }
}
