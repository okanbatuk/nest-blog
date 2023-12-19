import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from '../../database/factories/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  // Return all users
  getAll = async (): Promise<User[]> => {
    const users = await this.userRepository.find({ where: { isActive: true } });
    return users;
  };

  // Return user by id
  getById = async (uuid: string): Promise<User> => {
    const user = await this.userRepository.findOne({
      where: { uuid, isActive: true },
    });
    return user;
  };

  // Set isActive field to false
  delete = async (user: User): Promise<void> => {
    user.deletedAtDate = user.updatedAtDate = new Date();
    user.deletedAtTime = user.updatedAtTime = new Date().toLocaleTimeString();
    user.isActive = false;
    await user.save();
  };
}
