import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './common/guards';
import { CoreModule } from './common/modules/core.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './models/users/users.module';
import { PostsModule } from './models/posts/posts.module';

@Module({
  imports: [UsersModule, AuthModule, CoreModule, PostsModule],
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
