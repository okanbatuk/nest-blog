import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entities and Dtos
import { CreatePostDto, UpdatePostDto } from './dtos';
import Post from '../../database/factories/post.entity';
import User from '../../database/factories/user.entity';

//Commons
import { Service } from '../../common/types/service';

@Injectable()
export class PostsService implements Service<Post> {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
  ) {}

  getAll = async (): Promise<Post[]> => {
    const posts = await this.postRepository.find({
      where: { isDeleted: false },
      relations: { user: true },
    });
    return posts;
  };

  getById = async (uuid: string): Promise<Post | null> => {
    const post = await this.postRepository.findOne({
      where: { uuid, isDeleted: false },
      relations: { user: true },
    });
    return post;
  };

  create = async (payload: CreatePostDto, user: User): Promise<Post> => {
    const newPost = this.postRepository.create(payload);
    newPost.user = user;
    return this.postRepository.save(newPost);
  };

  update = async (
    uuid: string,
    payload: UpdatePostDto,
  ): Promise<number | undefined> => {
    const { affected } = await this.postRepository.update(
      { uuid, isDeleted: false },
      payload,
    );
    return affected;
  };

  delete = async (uuid: string): Promise<number | undefined> => {
    const { affected } = await this.postRepository.update(
      { uuid },
      {
        deletedAt: new Date(),
        isDeleted: true,
      },
    );
    return affected;
  };
}
