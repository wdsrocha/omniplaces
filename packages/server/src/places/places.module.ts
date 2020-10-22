import { Module } from '@nestjs/common';
import { GoogleAdapter } from 'src/adapters/GoogleAdapter';
import { ContextManager } from 'src/contextManager';
import { InferenceEngine } from 'src/inferenceEngine';
import { PlacesController } from './places.controller';

@Module({
  imports: [],
  controllers: [PlacesController],
  providers: [ContextManager, InferenceEngine, GoogleAdapter],
})
export class PlacesModule {}
