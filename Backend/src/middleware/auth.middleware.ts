import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwtUtils';
import { AuthRequest, ApiResponse } from '../types';

export const authenticateToken = (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
      return;
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(403).json({
        success: false,
        message: 'Invalid or expired token',
      });
      return;
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      phone: decoded.phone,
    };

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Optional: Middleware to check if user is admin (for future use)
export const isAdmin = (
  _req: AuthRequest,
  _res: Response<ApiResponse>,
  next: NextFunction
): void => {
  // Implement admin check logic here
  // For now, just pass through
  next();
};
