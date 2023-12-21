import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from '../../database/factories/user.entity';
import { Service } from '../../common/types/service';

@Injectable()
export class UsersService implements Service<User> {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  // Return all users
  getAll = async (): Promise<User[]> => {
    const users = await this.userRepository.find({ where: { isActive: true } });
    return users;
  };

  // Return user by id
  getById = async (uuid: string): Promise<User | null> => {
    const user = await this.userRepository.findOne({
      where: { uuid, isActive: true },
    });
    return user;
  };

  // Set isActive field to false
  delete = async (uuid: string): Promise<void> => {
    await this.userRepository.update(
      { uuid },
      {
        updatedAt: new Date(),
        deletedAt: new Date(),
        isActive: false,
      },
    );
  };
}
