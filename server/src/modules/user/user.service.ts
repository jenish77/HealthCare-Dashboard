import { User, IUser } from './user.model';
import { ApiError } from '../../utils/apiError';

export class UserService {
  static async getAllUsers(query: any = {}): Promise<IUser[]> {
    return await User.find(query).select('-passwordHash -refreshToken').sort({ createdAt: -1 });
  }

  static async getUserById(userId: string): Promise<IUser> {
    const user = await User.findById(userId).select('-passwordHash -refreshToken');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }

  static async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'doctor' | 'nurse';
  }): Promise<IUser> {
    const existing = await User.findOne({ email: userData.email.toLowerCase() });
    if (existing) {
      throw new ApiError(409, 'User with this email already exists');
    }

    const user = await User.create({
      name: userData.name,
      email: userData.email.toLowerCase(),
      passwordHash: userData.password,
      role: userData.role,
    });

    return (await User.findById(user._id).select('-passwordHash -refreshToken'))!;
  }

  static async updateUser(
    userId: string,
    updates: { name?: string; role?: 'admin' | 'doctor' | 'nurse'; isActive?: boolean; password?: string }
  ): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (updates.name) user.name = updates.name;
    if (updates.role) user.role = updates.role;
    if (typeof updates.isActive === 'boolean') user.isActive = updates.isActive;
    if (updates.password) user.passwordHash = updates.password;

    await user.save();
    return (await User.findById(user._id).select('-passwordHash -refreshToken'))!;
  }
}
