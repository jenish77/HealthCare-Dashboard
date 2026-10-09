import request from 'supertest';
import app from '../src/app';
import mongoose from 'mongoose';
import { User } from '../src/modules/user/user.model';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('Auth Integration Tests', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  let refreshToken: string;

  it('should register a new clinician user model', async () => {
    const user = await User.create({
      name: 'Test Doctor',
      email: 'doctor_test@healthtech.org',
      passwordHash: 'Doctor@123456',
      role: 'doctor',
    });

    expect(user._id).toBeDefined();
    expect(user.email).toBe('doctor_test@healthtech.org');
  });

  it('should login clinician with valid credentials and return JWT tokens', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'doctor_test@healthtech.org',
        password: 'Doctor@123456',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();

    refreshToken = res.body.data.refreshToken;
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'doctor_test@healthtech.org',
        password: 'WrongPassword123',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should refresh access token using valid refresh token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('should return 401 when accessing protected route without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
