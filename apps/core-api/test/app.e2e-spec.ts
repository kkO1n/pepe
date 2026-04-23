import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import type Redis from 'ioredis';
import { PARAMS_PROVIDER_TOKEN } from 'nestjs-pino';
import { DATA_SOURCE } from '@core-api/common/constants';
import { REDIS } from '@core-api/providers/databases/redis/redis.module';
import request from 'supertest';
import type { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { coreApiTestEnv } from './test-env';
import {
  cleanupDatabase,
  ensureTestDatabase,
  runMigrations,
} from './helpers/db-cleanup';

describe('App (e2e)', () => {
  let app: INestApplication;
  type SupertestTarget = Parameters<typeof request>[0];

  const httpServer = (): SupertestTarget =>
    app.getHttpServer() as unknown as SupertestTarget;

  const api = () => request(httpServer());
  const apiAgent = () => request.agent(httpServer());

  const buildRegisterPayload = () => {
    const unique = Date.now().toString() + Math.random().toString().slice(2, 6);
    return {
      login: `user_${unique}`,
      email: `user_${unique}@example.com`,
      password: 'secret',
      age: 21,
      description: 'test-user',
    };
  };

  const extractRefreshCookie = (
    setCookie: string | string[] | undefined,
  ): string | null => {
    const cookies = Array.isArray(setCookie)
      ? setCookie
      : typeof setCookie === 'string'
        ? [setCookie]
        : [];

    if (!cookies.length) return null;
    const refreshCookie = cookies.find((cookie) =>
      cookie.startsWith('refresh_token='),
    );
    if (!refreshCookie) return null;

    return refreshCookie.split(';')[0] ?? null;
  };

  const registerAndGetAccessToken = async (): Promise<string> => {
    const payload = buildRegisterPayload();
    const response = await api()
      .post('/auth/register')
      .send(payload)
      .expect(201);

    return getStringField(response.body as unknown, 'access_token');
  };

  const getStringField = (value: unknown, key: string): string => {
    if (typeof value !== 'object' || value === null) {
      throw new Error(`Expected object response body while reading "${key}"`);
    }

    const record = value as Record<string, unknown>;
    const field = record[key];

    if (typeof field !== 'string') {
      throw new Error(`Expected "${key}" to be string`);
    }

    return field;
  };

  const getNumberField = (value: unknown, key: string): number => {
    if (typeof value !== 'object' || value === null) {
      throw new Error(`Expected object response body while reading "${key}"`);
    }

    const record = value as Record<string, unknown>;
    const field = record[key];

    if (typeof field !== 'number') {
      throw new Error(`Expected "${key}" to be number`);
    }

    return field;
  };

  beforeAll(async () => {
    try {
      await ensureTestDatabase();
      await runMigrations();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `E2E Postgres setup failed for database "${coreApiTestEnv.DB_NAME}": ${message}`,
      );
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PARAMS_PROVIDER_TOKEN)
      .useValue({
        pinoHttp: {
          level: 'silent',
          autoLogging: false,
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    await app.init();
  });

  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterAll(async () => {
    if (!app) return;

    const dataSource = app.get<DataSource>(DATA_SOURCE);
    const redis = app.get<Redis>(REDIS);

    await dataSource.destroy();
    redis.disconnect();
    await app.close();
  });

  it('POST /auth/register should create user and set refresh cookie', async () => {
    const response = await api()
      .post('/auth/register')
      .send(buildRegisterPayload())
      .expect(201);

    expect(getStringField(response.body as unknown, 'access_token')).toEqual(
      expect.any(String),
    );
    expect(extractRefreshCookie(response.headers['set-cookie'])).not.toBeNull();
  });

  it('POST /auth/register should return 400 for invalid payload', async () => {
    await api().post('/auth/register').send({ login: 'x' }).expect(400);
  });

  it('POST /auth/register should return 409 for duplicate login', async () => {
    const payload = buildRegisterPayload();
    await api().post('/auth/register').send(payload).expect(201);

    await api()
      .post('/auth/register')
      .send({
        ...payload,
        email: `another_${Date.now()}@example.com`,
      })
      .expect(409);
  });

  it('POST /auth/login should return access token and set refresh cookie', async () => {
    const payload = buildRegisterPayload();
    await api().post('/auth/register').send(payload).expect(201);

    const response = await api()
      .post('/auth/login')
      .send({
        login: payload.login,
        password: payload.password,
      })
      .expect(201);

    expect(getStringField(response.body as unknown, 'access_token')).toEqual(
      expect.any(String),
    );
    expect(extractRefreshCookie(response.headers['set-cookie'])).not.toBeNull();
  });

  it('POST /auth/login should return 401 for invalid credentials', async () => {
    const payload = buildRegisterPayload();
    await api().post('/auth/register').send(payload).expect(201);

    await api()
      .post('/auth/login')
      .send({
        login: payload.login,
        password: 'wrong-password',
      })
      .expect(401);
  });

  it('POST /auth/refresh should issue new refresh cookie and keep previous token valid', async () => {
    const agent = apiAgent();
    const payload = buildRegisterPayload();

    const registerResponse = await agent
      .post('/auth/register')
      .send(payload)
      .expect(201);
    const oldRefreshCookie = extractRefreshCookie(
      registerResponse.headers['set-cookie'],
    );
    expect(oldRefreshCookie).not.toBeNull();

    const refreshResponse = await agent.post('/auth/refresh').expect(201);

    expect(
      getStringField(refreshResponse.body as unknown, 'access_token'),
    ).toEqual(expect.any(String));
    const newRefreshCookie = extractRefreshCookie(
      refreshResponse.headers['set-cookie'],
    );
    expect(newRefreshCookie).not.toBeNull();
    expect(newRefreshCookie).not.toEqual(oldRefreshCookie);

    await api()
      .post('/auth/refresh')
      .set('Cookie', oldRefreshCookie ?? '')
      .expect(201);

    await api()
      .post('/auth/refresh')
      .set('Cookie', newRefreshCookie ?? '')
      .expect(201);
  });

  it('POST /auth/login should keep previous refresh session valid', async () => {
    const payload = buildRegisterPayload();
    const registerResponse = await api()
      .post('/auth/register')
      .send(payload)
      .expect(201);
    const firstRefreshCookie = extractRefreshCookie(
      registerResponse.headers['set-cookie'],
    );
    expect(firstRefreshCookie).not.toBeNull();

    const loginResponse = await api()
      .post('/auth/login')
      .send({
        login: payload.login,
        password: payload.password,
      })
      .expect(201);
    const secondRefreshCookie = extractRefreshCookie(
      loginResponse.headers['set-cookie'],
    );
    expect(secondRefreshCookie).not.toBeNull();
    expect(secondRefreshCookie).not.toEqual(firstRefreshCookie);

    await api()
      .post('/auth/refresh')
      .set('Cookie', firstRefreshCookie ?? '')
      .expect(201);

    await api()
      .post('/auth/refresh')
      .set('Cookie', secondRefreshCookie ?? '')
      .expect(201);
  });

  it('POST /auth/logout should clear session and invalidate refresh token', async () => {
    const payload = buildRegisterPayload();
    const registerResponse = await api()
      .post('/auth/register')
      .send(payload)
      .expect(201);
    const refreshCookie = extractRefreshCookie(
      registerResponse.headers['set-cookie'],
    );
    expect(refreshCookie).not.toBeNull();

    await api()
      .post('/auth/logout')
      .set('Cookie', refreshCookie ?? '')
      .expect(204);

    await api()
      .post('/auth/refresh')
      .set('Cookie', refreshCookie ?? '')
      .expect(401);
  });

  it('GET /users should return 401 without bearer token', async () => {
    await api().get('/users?page=1&limit=10&login=abc').expect(401);
  });

  it('GET /avatars/me should return 401 without bearer token', async () => {
    await api().get('/avatars/me').expect(401);
  });

  it('GET /users should return 200 with bearer token', async () => {
    const accessToken = await registerAndGetAccessToken();

    await api()
      .get('/users?page=1&limit=10')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  it('GET /avatars/me should return 200 and list shape with bearer token', async () => {
    const accessToken = await registerAndGetAccessToken();

    const response = await api()
      .get('/avatars/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('GET /users should return 400 for invalid pagination values', async () => {
    const accessToken = await registerAndGetAccessToken();

    await api()
      .get('/users?page=0&limit=10')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);

    await api()
      .get('/users?page=1&limit=101')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);
  });

  it('PUT /users/:id should update user with partial payload', async () => {
    const accessToken = await registerAndGetAccessToken();
    const profileResponse = await api()
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const userId = getNumberField(profileResponse.body as unknown, 'id');

    await api()
      .put(`/users/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ description: 'updated-description' })
      .expect(200);
  });

  it('PUT /users/:id should return 400 when password is provided', async () => {
    const accessToken = await registerAndGetAccessToken();
    const profileResponse = await api()
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const userId = getNumberField(profileResponse.body as unknown, 'id');

    await api()
      .put(`/users/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ password: 'new-plaintext-password' })
      .expect(400);
  });

  it('PUT /users/:id should return 404 for missing user id', async () => {
    const accessToken = await registerAndGetAccessToken();

    await api()
      .put('/users/999999')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ description: 'updated-description' })
      .expect(404);
  });

  it('DELETE /users/:id should return 204', async () => {
    const accessToken = await registerAndGetAccessToken();
    const profileResponse = await api()
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const userId = getNumberField(profileResponse.body as unknown, 'id');

    await api()
      .delete(`/users/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);
  });
});
