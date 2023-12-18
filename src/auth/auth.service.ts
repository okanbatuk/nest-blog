import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from '../database/factories/user.entity';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dtos';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  // Get user by email
  getByEmail = async (email: string): Promise<User> => {
    const user = await this.userRepository.findOne({
      where: { email, isActive: true },
    });
    return user;
  };

  // Save the new user to PG
  register = async (payload: RegisterUserDto) => {
    try {
      const newUser = this.userRepository.create(payload);
      return this.userRepository.save(newUser);
    } catch (err) {
      throw err;
    }
  };
}
