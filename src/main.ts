import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

(async () => {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });
  app.use(helmet());
  app.setGlobalPrefix('api');
  await app.listen(3000);
})();
