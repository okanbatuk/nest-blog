import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import Redis from 'ioredis';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './../src/app.module';
import { LoginUserDto, RegisterUserDto } from 'src/auth/dtos';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let res: request.Response;
  let redis: Redis;
  let newUser: RegisterUserDto;
  let loginUser: LoginUserDto = {
    email: 'john@test.com',
    password: 'johndoe1',
  };
  let existUser: RegisterUserDto = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@test.com',
    password: 'johndoe1',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    redis = new Redis();
    app = moduleFixture.createNestApplication();
    app.use(helmet());
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await redis.flushall();
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(HttpStatus.NOT_FOUND)
      .expect({
        message: 'Cannot GET /',
        error: 'Not Found',
        statusCode: HttpStatus.NOT_FOUND,
      });
  });

  describe('User Registration', () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/api/register')
        .send(existUser)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');
    });

    it('POST /api/register', async () => {
      res = await request(app.getHttpServer())
        .post('/api/register')
        .send(existUser)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');

      expect(res.statusCode).toBe(HttpStatus.CONFLICT);
    });

    it('POST /api/register', async () => {
      newUser = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@test.com',
        password: 'janedoe1',
      };
      res = await request(app.getHttpServer())
        .post('/api/register')
        .send(newUser)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');

      expect(res.statusCode).toBe(HttpStatus.CREATED);
    });
  });

  describe('Login User', () => {
    let payload: Types.Payload;

    it('POST /api/login should return user and token', async () => {
      res = await request(app.getHttpServer())
        .post('/api/login')
        .send(loginUser)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');

      payload = res.body;
      const refreshToken = res.headers['set-cookie'][0]
        .split(' ')[0]
        .split('=')[1]
        .split(';')[0];

      expect(await redis.smembers(payload.uuid)).toEqual(
        expect.arrayContaining([refreshToken]),
      );
      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body).toEqual({
        accessToken: expect.any(String),
        uuid: expect.any(String),
        firstName: 'John',
        lastName: 'Doe',
      });
    });
  });

  describe('Refresh the Access Token and Logout Session', () => {
    let payload: Types.Payload;
    let refreshToken: string;

    beforeEach(async () => {
      res = await request(app.getHttpServer())
        .post('/api/login')
        .send(loginUser)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');

      payload = res.body;
      refreshToken = res.headers['set-cookie'][0]
        .split(' ')[0]
        .split('=')[1]
        .split(';')[0];
    });

    it('GET /api/refresh/:uuid -- should return new Access Token', async () => {
      res = await request(app.getHttpServer())
        .get(`/api/refresh/${payload.uuid}`)
        .set('Cookie', [`jwt=${refreshToken};`])
        .set('Accept', 'application/json');

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body).toEqual({
        accessToken: expect.any(String),
      });
    });

    it('GET /api/refresh/:uuid -- should return Unauthorized Error', async () => {
      res = await request(app.getHttpServer())
        .get(`/api/refresh/${payload.uuid}`)
        .set('Accept', 'application/json');

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(res.body).toEqual({
        message: 'Cookie was not provided',
        error: 'Unauthorized',
        statusCode: 401,
      });
    });

    it('GET /api/logout', async () => {
      res = await request(app.getHttpServer())
        .get('/api/logout')
        .set('Cookie', [`jwt=${refreshToken};`])
        .set('Accept', 'application/json');

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body).toEqual({
        message: 'Logged out successfully',
        status: HttpStatus.OK,
      });
    });

    it('GET /api/logout', async () => {
      res = await request(app.getHttpServer())
        .get('/api/logout')
        .set('Accept', 'application/json');

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(res.body).toEqual(
        expect.objectContaining({
          statusCode: HttpStatus.UNAUTHORIZED,
        }),
      );
    });
  });
});

module Types {
  export type Payload = {
    accessToken: string;
    uuid: string;
    firstName: string;
    lastName: string;
  };
}
