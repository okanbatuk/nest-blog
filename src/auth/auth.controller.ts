import {
  Body,
  ClassSerializerInterceptor,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Redis } from 'ioredis';
import { AuthService } from './auth.service';
import { LoginUserDto, RegisterUserDto } from './dtos';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('/')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  #redis = new Redis();

  constructor(
    @Inject('AUTH_SERVICE') private authService: AuthService,
    @Inject('JWT_SERVICE') private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  @Post('login')
  async loginUser(
    @Body() userPayload: LoginUserDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Get user by email
    const user = await this.authService.getByEmail(
      userPayload.email.toLowerCase(),
    );
    if (!user) throw new NotFoundException('User Not Found');

    // Compare the password
    const check = await bcrypt.compare(userPayload.password, user.password);
    if (!check) throw new ForbiddenException('Invalid password');

    const { jwt } = req.cookies;

    // Delete the user token/tokens
    jwt &&
      (res.clearCookie('jwt', {
        httpOnly: true,
        // secure:true,
        // sameSite:'none'
      }),
      await this.#redis.srem(user.uuid, jwt));

    // Create a token payload
    const payload: Types.Payload = {
      sub: user.uuid,
      email: user.email,
      role: user.role,
    };

    // Generate an AccessToken
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      expiresIn: '1m',
    });

    // Generate a Refresh Token
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      expiresIn: '1d',
    });

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      // secure: true,
      // sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Save the refresh token
    await this.#redis
      .multi()
      .sadd(user.uuid, refreshToken)
      .expire(user.uuid, 24 * 60 * 60)
      .exec();

    return {
      accessToken,
      uuid: user.uuid,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async registerUser(@Body() userPayload: RegisterUserDto) {
    // Check email conflict
    const conflictUser = await this.authService.getByEmail(
      userPayload.email.toLowerCase(),
    );

    // If conflict user exist throw an Conflict Error
    if (conflictUser)
      throw new ConflictException('Email has already been used!!');

    // Hash the password
    const hashedPassword = await bcrypt.hash(userPayload.password, 10);

    try {
      // Save the user with hashed password
      await this.authService.register({
        ...userPayload,
        password: hashedPassword,
      });
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  @Get('refresh/:uuid')
  async regenerateToken(
    @Param('uuid', ParseUUIDPipe)
    uuid: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { jwt } = req.cookies;
    if (!jwt) return new UnauthorizedException('Cookie was not provided');

    res.clearCookie('jwt', {
      httpOnly: true,
      // secure: true,
      // sameSite: 'none',
    });

    const decoded: Types.Payload = await this.jwtService.verifyAsync(jwt, {
      secret: this.configService.get('REFRESH_TOKEN_SECRET'),
    });
    if (!decoded) return new HttpException('No Content', HttpStatus.NO_CONTENT);

    if (uuid !== decoded.sub) {
      await this.#redis.del(decoded.sub);
      return new ForbiddenException();
    }

    await this.#redis.srem(decoded.sub, jwt);

    const payload = {
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
    // Generate a new AccessToken
    const newAccessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      expiresIn: '1m',
    });

    // Generate a new Refresh Token
    const newRefreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      expiresIn: '1d',
    });

    res.cookie('jwt', newRefreshToken, {
      httpOnly: true,
      // secure: true,
      // sameSite: 'none',
    });

    // Save the refresh token
    await this.#redis
      .multi()
      .sadd(decoded.sub, newRefreshToken)
      .expire(decoded.sub, 24 * 60 * 60)
      .exec();

    return { accessToken: newAccessToken };
  }

  @Get('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { jwt } = req.cookies;
    if (!jwt) return new UnauthorizedException('Cookie was not provided');

    res.clearCookie('jwt', {
      httpOnly: true,
      // secure:true,
      // sameSite:"none"
    });

    const decoded: Types.Payload = await this.jwtService.verifyAsync(jwt, {
      secret: this.configService.get('REFRESH_TOKEN_SECRET'),
    });
    if (!decoded) return new HttpException('No Content', HttpStatus.NO_CONTENT);

    let count = await this.#redis.scard(decoded.sub);

    count > 1
      ? await this.#redis.srem(decoded.sub, jwt)
      : await this.#redis.del(decoded.sub);

    return { message: 'Logged out successfully', status: HttpStatus.OK };
  }
}

module Types {
  export type Payload = { sub: string; email: string; role: string };
}