import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JWTUserInfo {
  roles: string[];
  id: string;
}

interface JWTDecoded {
  UserInfo: JWTUserInfo;
}

// Extend the Express Request interface to include custom properties
interface CustomRequest extends Request {
  user?: {
    userId: string;
    roles: string[];
  };
  roles?: string[];
  userId?: string;
}

const verifyJWT = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.cookies.accessToken as string | undefined;
  if (!authHeader) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  jwt.verify(
    authHeader,
    process.env.ACCESS_TOKEN_SECRET as string,
    (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid Token' });
      }

      const { UserInfo } = decoded as JWTDecoded;
      req.roles = UserInfo.roles;
      req.userId = UserInfo.id;

      req.user = {
        userId: UserInfo.id,
        roles: UserInfo.roles,
      } as any;

      next();
    }
  );
};

export default verifyJWT;
