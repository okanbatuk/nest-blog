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
import { UsersService } from './users.service';
import User from '../../database/factories/user.entity';
import { SerializedUser } from './entities/serialized-user';
import { Roles, RolesDecorator } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards';

@Controller('users')
@UseGuards(RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  #redis = new Redis();

  constructor(@Inject('USERS_SERVICE') private usersService: UsersService) {}

  @Get()
  @RolesDecorator([Roles.ADMIN])
  async getAllUser(): Promise<User[]> {
    const users = await this.usersService.getAll();
    if (!users.length) throw new NotFoundException('There is no user');
    return users;
  }
  @Get('profile')
  async getUserProfile(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SerializedUser> {
    const user = await this.usersService.getById(req.user.sub);
    if (!user) {
      res.clearCookie('jwt', {
        httpOnly: true,
        // secure:true,
        // sameSite:"none"
      });
      this.#redis.del(req.user.sub);
      throw new InternalServerErrorException('Something went wrong');
    }
    const serializedUser = new SerializedUser(user);
    return serializedUser;
  }

  @Get(':uuid')
  async getUserById(
    @Param('uuid', ParseUUIDPipe) uuid: string,
  ): Promise<SerializedUser> {
    const user = await this.usersService.getById(uuid);
    if (!user) throw new NotFoundException('User not found');
    const serializedUser = new SerializedUser(user);
    return serializedUser;
  }

  @Delete(':uuid')
  async deleteUser(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (uuid !== req.user.sub) {
      res.clearCookie('jwt', {
        httpOnly: true,
        // secure:true,
        // sameSite:"none"
      });
      this.#redis.del(req.user.sub);
      throw new ForbiddenException();
    }
    const user = await this.usersService.getById(req.user.sub);
    await this.usersService.delete(user);
  }
}
