import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  ParseUUIDPipe,
  Body,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Patch,
  Delete,
  Req,
  Res,
  ForbiddenException,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import { Response } from 'express';

// Services
import { PostsService } from './posts.service';
import { UsersService } from '../users/users.service';

// Entities and Dtos
import PostEntity from '../../database/factories/post.entity';
import { SerializedPost } from './entities/serialized-post';
import { CreatePostDto, UpdatePostDto } from './dtos';

// Commons
import { Roles, RolesDecorator } from '../../common/decorators/roles.decorator';
import convertDateUtil from '../../common/utils/convert-date.util';
import { RolesGuard } from '../../common/guards';
import { plainToClass, plainToInstance } from 'class-transformer';

@Controller('posts')
@UseGuards(RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class PostsController {
  #redis = new Redis();

  constructor(
    @Inject('POSTS_SERVICE') private postsService: PostsService,
    @Inject('USERS_SERVICE') private usersService: UsersService,
  ) {}

  @Get()
  async getAllPosts(): Promise<SerializedPost[]> {
    const posts = await this.postsService.getAll();
    if (!posts.length) throw new NotFoundException('There is no posts');
    const serializedPosts = posts.map((post) =>
      plainToInstance(SerializedPost, convertDateUtil(post), {
        enableImplicitConversion: true,
      }),
    );
    return serializedPosts;
  }

  @Get(':uuid')
  async getPostById(
    @Param('uuid', ParseUUIDPipe) uuid: string,
  ): Promise<SerializedPost> {
    const post = await this.postsService.getById(uuid);
    if (!post) throw new NotFoundException('Post not found');

    // Serialize the post with converted dates
    const serializedPost = plainToInstance(
      SerializedPost,
      convertDateUtil(post),
      {
        enableImplicitConversion: true,
      },
    );
    return serializedPost;
  }

  @Post()
  @RolesDecorator([Roles.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Body() payload: CreatePostDto,
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const user = await this.usersService.getById(req.user.sub);
      if (!user) {
        res.clearCookie('jwt', {
          httpOnly: true,
          // secure:true,
          // sameSite:"none"
        });
        await this.#redis.del(req.user.sub);
        throw new ForbiddenException();
      }
      await this.postsService.create(payload, user);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  @Patch(':uuid')
  @RolesDecorator([Roles.ADMIN])
  @HttpCode(HttpStatus.OK)
  async updatePost(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() payload: UpdatePostDto,
  ): Promise<{ message: string }> {
    // Get the post by id
    const post = await this.postsService.getById(uuid);
    if (!post) throw new NotFoundException();

    // Update the post
    const affected = await this.postsService.update(uuid, payload);
    if (!affected) throw new InternalServerErrorException();
    return { message: 'Resource updated successfully!' };
  }

  @Delete(':uuid')
  @RolesDecorator([Roles.ADMIN])
  @HttpCode(HttpStatus.OK)
  async deletePost(@Param('uuid') uuid: string): Promise<{ message: string }> {
    // Get the post by id
    const post = await this.postsService.getById(uuid);
    if (!post) throw new NotFoundException();

    // Delete the post
    const affected = await this.postsService.delete(uuid);
    if (!affected) throw new InternalServerErrorException();
    return { message: 'Resource deleted successfully!' };
  }
}
