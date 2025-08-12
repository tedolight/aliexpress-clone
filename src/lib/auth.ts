import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
};

export const getTokenFromRequest = (req: NextRequest): string | null => {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
};

export const authenticateUser = async (req: NextRequest) => {
  const token = getTokenFromRequest(req);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await User.findById(payload.userId).select('-password');
  return user;
};

export const requireAuth = async (req: NextRequest) => {
  const user = await authenticateUser(req);
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
};

export const requireRole = (roles: string[]) => {
  return async (req: NextRequest) => {
    const user = await requireAuth(req);
    if (!roles.includes(user.role)) {
      throw new Error('Insufficient permissions');
    }
    return user;
  };
}; 