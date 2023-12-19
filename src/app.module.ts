import { Module } from '@nestjs/common';
import { UsersModule } from './models/users/users.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './common/guards';
import { CoreModule } from './common/modules/core.module';

@Module({
  imports: [UsersModule, AuthModule, CoreModule],
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
