import { Controller, Get, Headers, Param, Query } from '@nestjs/common';
import { ContextManager } from 'src/contextManager';

@Controller()
export class PlacesController {
  constructor(private readonly contextManager: ContextManager) {}

  @Get('suggest')
  async suggest(
    @Headers('accept-language') language,
    @Headers('geolocation') geolocation,
    @Query('q') query,
  ) {
    return await this.contextManager.suggest(query, language, geolocation);
  }

  @Get('lookup/:id')
  async lookup(
    @Headers('accept-language') language,
    @Headers('geolocation') geolocation,
    @Param('id') id,
  ) {
    return await this.contextManager.lookup(id, language, geolocation);
  }
}
