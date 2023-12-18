import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Redis } from 'ioredis';
import { AppModule } from './../src/app.module';
import { LoginUserDto } from 'src/auth/dtos';
import User from 'src/database/factories/user.entity';

describe('Users Routes (e2e)', () => {
  let app: INestApplication;
  let res: request.Response;
  let redis: Redis;
  let loginUser: LoginUserDto;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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
      expect(res.body).toEqual(expect.arrayContaining([User]));
    });

    it('GET /api/users/:uuid -- should return a user', async () => {
      res = await request(app.getHttpServer())
        .get('/api/users/8630bb72-19c7-442b-be9b-75c66e6c751e')
        .set('Authorization', `Bearer ${payload.accessToken}`)
        .set('Accept', 'application/json');

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body).toEqual(
        expect.objectContaining({
          // TODO: Change user to Serialized User
          User,
        }),
      );
    });

    it("GET /api/users/profile -- should return the logged in user's profile information", async () => {
      res = await request(app.getHttpServer())
        .delete('/api/users/profile')
        .set('Authorization', `Bearer ${payload.accessToken}`)
        .set('Accept', 'application/json');

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body).toEqual(
        expect.objectContaining({
          // TODO: Change user to Serialized User
          User,
        }),
      );
    });

    it('DELETE /api/users/:uuid -- should return ok and delete the user', async () => {
      res = await request(app.getHttpServer())
        .delete('/api/users/71604b8a-4f36-4eaf-bdcf-2ae618a4fdfc')
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
