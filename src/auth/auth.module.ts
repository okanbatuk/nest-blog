import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from '../database/factories/user.entity';
import { CoreModule } from '../common/modules/core.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), CoreModule],
  controllers: [AuthController],
  providers: [{ provide: 'AUTH_SERVICE', useClass: AuthService }],
})
export class AuthModule {}
