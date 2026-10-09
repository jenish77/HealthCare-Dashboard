import jwt, { JwtPayload } from 'jsonwebtoken';

export interface TokenPayload {
  _id: string;
  email: string;
  role: 'admin' | 'doctor' | 'nurse';
}

export const generateAccessToken = (payload: TokenPayload): string => {
  const secret = process.env.ACCESS_TOKEN_SECRET || 'healthtech_access_secret_key_2026_super_secure_987654321';
  const expiresIn = process.env.ACCESS_TOKEN_EXPIRE || '15m';
  return jwt.sign(payload, secret, { expiresIn: expiresIn as any });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const secret = process.env.REFRESH_TOKEN_SECRET || 'healthtech_refresh_secret_key_2026_super_secure_123456789';
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRE || '7d';
  return jwt.sign(payload, secret, { expiresIn: expiresIn as any });
};

export const verifyAccessToken = (token: string): TokenPayload & JwtPayload => {
  const secret = process.env.ACCESS_TOKEN_SECRET || 'healthtech_access_secret_key_2026_super_secure_987654321';
  return jwt.verify(token, secret) as TokenPayload & JwtPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload & JwtPayload => {
  const secret = process.env.REFRESH_TOKEN_SECRET || 'healthtech_refresh_secret_key_2026_super_secure_123456789';
  return jwt.verify(token, secret) as TokenPayload & JwtPayload;
};
