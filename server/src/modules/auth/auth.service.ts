import { User, IUser } from '../user/user.model';
import { ApiError } from '../../utils/apiError';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../config/jwt';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  static async registerUser(userData: {
    name: string;
    email: string;
    password: string;
    role?: 'admin' | 'doctor' | 'nurse';
  }): Promise<IUser> {
    const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
    if (existingUser) {
      throw new ApiError(409, 'User with this email already exists');
    }

    const user = await User.create({
      name: userData.name,
      email: userData.email.toLowerCase(),
      passwordHash: userData.password,
      role: userData.role || 'nurse',
    });

    return user;
  }

  static async loginUser(email: string, password: string): Promise<{ user: IUser; tokens: AuthTokens }> {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash +refreshToken');
    if (!user || !user.passwordHash) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Account is deactivated. Contact an administrator.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const payload = { _id: user._id.toString(), email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    const sanitizedUser = await User.findById(user._id);

    return { user: sanitizedUser!, tokens: { accessToken, refreshToken } };
  }

  static async refreshAccessToken(incomingRefreshToken: string): Promise<{ tokens: AuthTokens; user: IUser }> {
    if (!incomingRefreshToken) {
      throw new ApiError(401, 'Refresh token missing');
    }

    let decoded: any;
    try {
      decoded = verifyRefreshToken(incomingRefreshToken);
    } catch (error) {
      throw new ApiError(401, 'Expired or invalid refresh token');
    }

    const user = await User.findById(decoded._id).select('+refreshToken');
    if (!user || user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, 'Invalid or reused refresh token');
    }

    const payload = { _id: user._id.toString(), email: user.email, role: user.role };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    user.refreshToken = newRefreshToken;
    await user.save();

    return { tokens: { accessToken: newAccessToken, refreshToken: newRefreshToken }, user };
  }

  static async logoutUser(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  }
}
