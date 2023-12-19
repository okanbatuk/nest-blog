import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Redis } from 'ioredis';
import { AppModule } from './../src/app.module';
import { LoginUserDto } from '../src/auth/dtos';

describe('Users Routes (e2e)', () => {
  let app: INestApplication;
  let res: request.Response;
  let redis: Redis;
  let loginUser: LoginUserDto;

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

  describe('Users Routes', () => {
    let payload: Types.Payload;
    beforeAll(async () => {
      loginUser = {
        email: 'john@test.com',
        password: 'johndoe1',
      };
      res = await request(app.getHttpServer())
        .post('/api/login')
        .send(loginUser)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');

      payload = res.body;
    });

    it('GET /api/users -- should return all users', async () => {
      res = await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${payload.accessToken}`)
        .set('Accept', 'application/json');

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            email: expect.any(String),
            firstName: expect.any(String),
            lastName: expect.any(String),
            role: expect.any(String),
          }),
        ]),
      );
    });

    it('GET /api/users/:uuid -- should return a user', async () => {
      res = await request(app.getHttpServer())
        .get('/api/users/7a494d20-09db-491d-8dea-89b910a2549b')
        .set('Authorization', `Bearer ${payload.accessToken}`)
        .set('Accept', 'application/json');

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body).toEqual(
        expect.objectContaining({
          email: 'jane@test.com',
          firstName: 'Jane',
          lastName: 'Doe',
          role: 'USER',
        }),
      );
    });

    it("GET /api/users/profile -- should return the logged in user's profile information", async () => {
      res = await request(app.getHttpServer())
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${payload.accessToken}`)
        .set('Accept', 'application/json');

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body).toEqual(
        expect.objectContaining({
          email: 'john@test.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'ADMIN',
        }),
      );
    });

    it('DELETE /api/users/:uuid -- should return ok and delete the user', async () => {
      res = await request(app.getHttpServer())
        .delete('/api/users/c074cc00-b61d-4d75-9578-9a22c33be046')
        .set('Authorization', `Bearer ${payload.accessToken}`)
        .set('Accept', 'application/json');

      expect(res.statusCode).toBe(HttpStatus.OK);
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
