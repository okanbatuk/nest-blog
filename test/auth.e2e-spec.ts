import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import Redis from 'ioredis';
import { LoginUserDto, RegisterUserDto } from 'src/auth/dtos';
import { User } from 'src/models/users/entities/User';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let res: request.Response;
  let redis: Redis;
  let dbUser: User;
  let loginUser: LoginUserDto;
  let existUser: RegisterUserDto;
  let newUser: RegisterUserDto;

  beforeAll(async () => {
    existUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      password: 'johndoe1',
    };

    await request(app.getHttpServer())
      .post('/api/register')
      .send(existUser)
      .set('Content-Type', 'application/json');
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    redis = new Redis();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await redis.flushall();
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
    loginUser = {
      email: 'john@test.com',
      password: 'johndoe1',
    };

    it('POST /api/login should return user and token', async () => {
      res = await request(app.getHttpServer())
        .post('/api/login')
        .send(loginUser)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body).toEqual({
        accessToken: expect.any(String),
        uuid: dbUser.uuid,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
      });
    });
  });

  describe('Refresh the Access Token', () => {
    loginUser = { email: 'john@test.com', password: 'johndoe1' };

    let payload: Types.Payload;
    let refreshToken: string;
    beforeEach(async () => {
      res = await request(app.getHttpServer())
        .post('/api/login')
        .send(loginUser)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');

      payload = res.body;
      const cookies = res.headers['set-cookie'];
      console.log(cookies);
    });

    it('GET /api/refresh/:uuid -- should return new Access Token', async () => {
      res = await request(app.getHttpServer)
        .get(`/api/refresh/${payload.uuid}`)
        .set('Cookie', `${refreshToken}`)
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
      expect(res.body).toEqual(
        expect.objectContaining({
          statusCode: HttpStatus.UNAUTHORIZED,
        }),
      );
    });
  });

  describe('Logout user', () => {
    let payload: Types.Payload;
    let refreshToken: string;
    beforeEach(async () => {
      res = await request(app.getHttpServer())
        .post('/api/login')
        .send()
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');

      payload = res.body;
      const cookies = res.headers['set-cookie'];
      console.log(cookies);
    });

    it('GET /api/logout', async () => {
      res = await request(app.getHttpServer())
        .get('/api/logout')
        .set('Cookie', `${refreshToken}`)
        .set('Accept', 'application/json');

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body).toEqual({ message: 'Logged out successfully' });
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
