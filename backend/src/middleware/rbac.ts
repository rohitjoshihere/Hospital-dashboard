import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from './auth';

type Role = JwtPayload['role'];

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    if (!roles.includes(user.role)) {
      res.status(403).json({ message: 'Forbidden: insufficient role' });
      return;
    }
    next();
  };
}
