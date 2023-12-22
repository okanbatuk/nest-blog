import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { UsersService } from '../users/users.service';
import Post from '../../database/factories/post.entity';
import User from 'src/database/factories/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, User]), JwtModule],
  controllers: [PostsController],
  providers: [
    {
      provide: 'POSTS_SERVICE',
      useClass: PostsService,
    },
    {
      provide: 'USERS_SERVICE',
      useClass: UsersService,
    },
  ],
})
export class PostsModule {}
