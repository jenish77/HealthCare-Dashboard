import request from 'supertest';
import app from '../src/app';
import mongoose from 'mongoose';
import { User } from '../src/modules/user/user.model';
import { generateAccessToken } from '../src/config/jwt';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('RBAC Access Control Tests', () => {
  let mongoServer: MongoMemoryServer;
  let nurseToken: string;
  let doctorToken: string;
  let adminToken: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    const nurse = await User.create({
      name: 'Nurse Unit',
      email: 'nurse_unit@healthtech.org',
      passwordHash: 'Pass@123',
      role: 'nurse',
    });

    const doctor = await User.create({
      name: 'Doctor Unit',
      email: 'doctor_unit@healthtech.org',
      passwordHash: 'Pass@123',
      role: 'doctor',
    });

    const admin = await User.create({
      name: 'Admin Unit',
      email: 'admin_unit@healthtech.org',
      passwordHash: 'Pass@123',
      role: 'admin',
    });

    nurseToken = generateAccessToken({ _id: nurse._id.toString(), email: nurse.email, role: 'nurse' });
    doctorToken = generateAccessToken({ _id: doctor._id.toString(), email: doctor.email, role: 'doctor' });
    adminToken = generateAccessToken({ _id: admin._id.toString(), email: admin.email, role: 'admin' });
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  it('should deny Nurse from accessing Admin user management endpoints with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${nurseToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Access Forbidden');
  });

  it('should deny Doctor from accessing Admin security audit log endpoints with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/audit-logs')
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.status).toBe(403);
  });

  it('should allow Admin to access audit logs', async () => {
    const res = await request(app)
      .get('/api/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
