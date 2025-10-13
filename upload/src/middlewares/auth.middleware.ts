import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const verifyToken = (token: string): { id: number; email: string; role: string } => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');
  return decoded as { id: number; email: string; role: string };
};

export const authMiddleware = (roleaccess: string[]) => {
  return function (req: Request, res: Response, next: NextFunction) {
    const cookieHeader = req.headers.cookie as string | undefined;
    if (!cookieHeader) {
      res.sendStatus(401);
      return;
    }

    const cookies = cookieHeader.split(';').reduce(
      (acc, current) => {
        const [key, value] = current.trim().split('=');
        acc[key] = value;
        return acc;
      },
      {} as Record<string, string>,
    );
    const token = cookies['token'];

    if (!token) {
      res.sendStatus(401);
      return;
    }

    const decoded = verifyToken(token);
    if (roleaccess.includes(decoded.role)) {
      next();
    } else {
      res.sendStatus(401);
      return;
    }
  };
};
