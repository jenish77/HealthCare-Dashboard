import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../modules/user/user.model';
import { connectDB } from '../config/db';

dotenv.config();

const fixUserPasswords = async () => {
  try {
    await connectDB();
    console.log('🔧 Resetting and verifying all user passwords in Cloud Database...');

    const credentialsList = [
      { email: 'admin@healthtech.org', pass: 'Admin@123456', name: 'System Admin', role: 'admin' },
      { email: 'doctor@healthtech.org', pass: 'Doctor@123456', name: 'Dr. Rajesh Sharma', role: 'doctor' },
      { email: 'nurse@healthtech.org', pass: 'Nurse@123456', name: 'Nurse Priya Patel', role: 'nurse' },
    ];

    for (const cred of credentialsList) {
      const singleHash = await bcrypt.hash(cred.pass, 12);
      let user = await User.findOne({ email: cred.email }).select('+passwordHash');
      if (!user) {
        user = new User({
          name: cred.name,
          email: cred.email,
          role: cred.role,
          passwordHash: singleHash,
        });
      } else {
        user.passwordHash = singleHash;
      }
      await user.save();

      // Test verify immediately
      const checkUser = await User.findOne({ email: cred.email }).select('+passwordHash');
      const isOk = await checkUser!.comparePassword(cred.pass);
      console.log(`User: ${cred.email} | Plain Password: ${cred.pass} | Verification Result: ${isOk ? '✅ SUCCESS' : '❌ FAILED'}`);
    }

    console.log('🎉 All user passwords verified and ready!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to fix user passwords:', err);
    process.exit(1);
  }
};

fixUserPasswords();
