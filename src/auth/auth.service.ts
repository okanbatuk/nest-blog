import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entities and Dtos
import User from '../database/factories/user.entity';
import { RegisterUserDto } from './dtos';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  // Update inactive users to Login
  activateUser = async (uuid: string): Promise<number | undefined> => {
    const { affected } = await this.userRepository.update(
      { uuid },
      {
        updatedAt: new Date(),
        isActive: true,
      },
    );
    return affected;
  };

  // Get user by email
  getByEmail = async (email: string): Promise<User | null> => {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    return user;
  };

  // Save the new user to PG
  register = async (payload: RegisterUserDto) => {
    try {
      const newUser = this.userRepository.create(payload);
      await this.userRepository.save(newUser);
    } catch (err) {
      throw err;
    }
  };
}
