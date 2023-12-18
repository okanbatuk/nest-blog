import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';

(async () => {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });
  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('PORT');
  app.use(helmet());
  app.setGlobalPrefix('api');
  await app.listen(PORT);
})();
