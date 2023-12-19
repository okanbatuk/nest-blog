import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Redis } from 'ioredis';
import { AppModule } from '../src/app.module';
import { LoginUserDto } from '../src/auth/dtos';
import { CreatePostDto, UpdatePostDto } from '../src/models/posts/dtos';

describe('Posts Routes (e2e)', () => {
  let app: INestApplication;
  let res: request.Response;
  let redis: Redis;
  let loginUser: LoginUserDto;

  let newPost: CreatePostDto;
  let update: UpdatePostDto;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    redis = new Redis();
    app.use(helmet());
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await redis.flushall();
    await app.close();
  });

  describe('Routes', () => {
    let token: string;

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

      token = res.body.accessToken;
    });

    it('GET /api/posts', async () => {
      res = await request(app.getHttpServer())
        .get('/api/posts')
        .set('Accept', 'application/json');

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            uuid: expect.any(String),
            title: expect.any(String),
            content: expect.any(String),
          }),
        ]),
      );
    });

    it('GET /api/posts/:uuid', async () => {
      res = await request(app.getHttpServer())
        //TODO: Add uuid
        .get('/api/posts/UUID')
        .set('Accept', 'application/json');

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body).toEqual(
        expect.objectContaining({
          uuid: expect.any(String),
          title: expect.any(String),
          content: expect.any(String),
        }),
      );
    });

    it('POST /api/posts', async () => {
      res = await request(app.getHttpServer())
        .post('/api/posts')
        .send(newPost)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');

      expect(res.statusCode).toBe(HttpStatus.CREATED);
    });

    it('PATCH /api/posts/:uuid', async () => {
      res = await request(app.getHttpServer())
        //TODO: Add uuid
        .patch('/api/posts/UUID')
        .send(update)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body).toEqual(
        expect.objectContaining({
          message: 'Resource updated successfully!',
        }),
      );
    });

    it('DELETE /api/posts/:uuid', async () => {
      res = await request(app.getHttpServer())
        //TODO: Add uuid
        .delete('/api/posts/UUID')
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json');

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body).toEqual(
        expect.objectContaining({
          message: 'Resource deleted successfully!',
        }),
      );
    });
  });
});
