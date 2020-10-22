import { NestFactory } from '@nestjs/core';
import { PlacesModule } from './places/places.module';

async function bootstrap() {
  const app = await NestFactory.create(PlacesModule);
  await app.listen(2000);
}
bootstrap();
