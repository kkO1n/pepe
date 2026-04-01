import './test-env';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { cleanupDatabase, ensureTestDatabase } from './helpers/db-cleanup';

describe('App (e2e)', () => {
  let app: INestApplication;

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
    setCookie: string[] | undefined,
  ): string | null => {
    if (!setCookie?.length) return null;
    const refreshCookie = setCookie.find((cookie) =>
      cookie.startsWith('refresh_token='),
    );
    return refreshCookie ?? null;
  };

  const registerAndGetAccessToken = async (): Promise<string> => {
    const payload = buildRegisterPayload();
    const response = await request(app.getHttpServer())
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
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      throw new Error(
        `E2E Postgres setup failed for database "${process.env.DB_NAME ?? 'db_test'}": ${message}`,
      );
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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
    if (app) {
      await app.close();
    }
  });

  it('POST /auth/register should create user and set refresh cookie', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(buildRegisterPayload())
      .expect(201);

    expect(getStringField(response.body as unknown, 'access_token')).toEqual(
      expect.any(String),
    );
    expect(extractRefreshCookie(response.headers['set-cookie'])).not.toBeNull();
  });

  it('POST /auth/register should return 400 for invalid payload', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ login: 'x' })
      .expect(400);
  });

  it('POST /auth/login should return access token and set refresh cookie', async () => {
    const payload = buildRegisterPayload();
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload)
      .expect(201);

    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload)
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        login: payload.login,
        password: 'wrong-password',
      })
      .expect(401);
  });

  it('POST /auth/refresh should rotate refresh cookie and return new access token', async () => {
    const agent = request.agent(app.getHttpServer());
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
  });

  it('GET /users should return 401 without bearer token', async () => {
    await request(app.getHttpServer())
      .get('/users?page=1&limit=10&login=abc')
      .expect(401);
  });

  it('GET /users should return 200 with bearer token', async () => {
    const accessToken = await registerAndGetAccessToken();

    await request(app.getHttpServer())
      .get('/users?page=1&limit=10')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  it('GET /users should return 400 for invalid pagination values', async () => {
    const accessToken = await registerAndGetAccessToken();

    await request(app.getHttpServer())
      .get('/users?page=0&limit=10')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);

    await request(app.getHttpServer())
      .get('/users?page=1&limit=101')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);
  });

  it('PUT /users/:id should update user with partial payload', async () => {
    const accessToken = await registerAndGetAccessToken();
    const profileResponse = await request(app.getHttpServer())
      .get('/profile/my')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const userId = getNumberField(profileResponse.body as unknown, 'id');

    await request(app.getHttpServer())
      .put(`/users/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ description: 'updated-description' })
      .expect(200);
  });

  it('DELETE /users/:id should return 204', async () => {
    const accessToken = await registerAndGetAccessToken();
    const profileResponse = await request(app.getHttpServer())
      .get('/profile/my')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const userId = getNumberField(profileResponse.body as unknown, 'id');

    await request(app.getHttpServer())
      .delete(`/users/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);
  });
});
