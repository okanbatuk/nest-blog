import {
  ClassSerializerInterceptor,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { Redis } from 'ioredis';

// Services
import { UsersService } from './users.service';

// Entities and Dtos
import User from '../../database/factories/user.entity';
import { SerializedUser } from './entities/serialized-user';

// Commons
import { Roles, RolesDecorator } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards';
import convertDateUtil from '../../common/utils/convert-date.util';

@Controller('users')
@UseGuards(RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  #redis = new Redis();

  constructor(@Inject('USERS_SERVICE') private usersService: UsersService) {}

  @Get()
  @RolesDecorator([Roles.ADMIN])
  async getAllUser(): Promise<SerializedUser[]> {
    const users = await this.usersService.getAll();
    if (!users.length) throw new NotFoundException('There is no user');

    // Serialize the user with converted dates
    const serializedUsers = users.map(
      (user) => new SerializedUser(convertDateUtil<User>(user)),
    );
    return serializedUsers;
  }
  @Get('profile')
  async getUserProfile(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SerializedUser> {
    const user = await this.usersService.getById(req.user.sub);

    // If user null, destroy the session and return error
    if (!user) {
      res.clearCookie('jwt', {
        httpOnly: true,
        // secure:true,
        // sameSite:"none"
      });
      this.#redis.del(req.user.sub);
      throw new InternalServerErrorException('Something went wrong');
    }

    // Serialize the user with converted dates
    const serializedUser = new SerializedUser(convertDateUtil<User>(user));
    return serializedUser;
  }

  @Get(':uuid')
  async getUserById(
    @Param('uuid', ParseUUIDPipe) uuid: string,
  ): Promise<SerializedUser> {
    const user = await this.usersService.getById(uuid);
    if (!user) throw new NotFoundException('User not found');

    // Serialize the user with converted dates
    const serializedUser = new SerializedUser(convertDateUtil<User>(user));
    return serializedUser;
  }

  @Delete(':uuid')
  async deleteUser(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    res.clearCookie('jwt', {
      httpOnly: true,
      // secure:true,
      // sameSite:"none"
    });
    await this.#redis.del(req.user.sub);

    // If logged in user's uuid is different, return error
    if (req.user.sub !== uuid) throw new ForbiddenException();

    // Delete the user
    const affected = await this.usersService.delete(req.user.sub);
    if (!affected) throw new InternalServerErrorException();
    return { message: 'Resource deleted successfully' };
  }
}
