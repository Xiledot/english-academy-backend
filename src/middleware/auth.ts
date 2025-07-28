import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    name: string;
    role: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        error: '인증 토큰이 필요합니다.' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ 
      error: '유효하지 않은 토큰입니다.' 
    });
  }
};

// 역할별 권한 확인 미들웨어
export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: '인증이 필요합니다.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: '접근 권한이 없습니다.' 
      });
    }

    next();
  };
}; 