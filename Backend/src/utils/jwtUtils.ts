import jwt from 'jsonwebtoken';
import { IJWTPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

export const generateToken = (payload: IJWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE as any,
  });
};

export const verifyToken = (token: string): IJWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as IJWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

export const decodeToken = (token: string): IJWTPayload | null => {
  try {
    const decoded = jwt.decode(token) as IJWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};
