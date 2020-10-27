import { Injectable, NotFoundException } from '@nestjs/common';
import { AdapterName } from './adapters/adapter';
import { GoogleAdapter } from './adapters/GoogleAdapter';
import { BaiduAdapter } from './adapters/BaiduAdapter';
import { InferenceEngine } from './inferenceEngine';

@Injectable()
export class ContextManager {
  constructor(
    private readonly inferenceEngine: InferenceEngine,
    private readonly googleAdapter: GoogleAdapter,
    private readonly baiduAdapter: BaiduAdapter,
  ) {}

  async suggest(query: string, language?: string, geolocation?: string) {
    const serviceName = await this.inferenceEngine.inferService({
      language,
      geolocation,
    });

    switch (serviceName) {
      case AdapterName.Google:
        return await this.googleAdapter.suggestAddresses(query, { language });
      case AdapterName.Baidu:
        return await this.baiduAdapter.suggestAddresses(query, { language });
      default:
        throw new NotFoundException(`Can't find '${serviceName}' service.`);
    }
  }

  async lookup(id: string, language?: string, geolocation?: string) {
    const serviceName = await this.inferenceEngine.inferService({
      language,
      geolocation,
    });

    switch (serviceName) {
      case AdapterName.Google:
        return await this.googleAdapter.lookup(id, { language });
      case AdapterName.Baidu:
        return await this.baiduAdapter.lookup(id, { language });
      default:
        throw new NotFoundException(`Can't find '${serviceName}' service.`);
    }
  }
}
