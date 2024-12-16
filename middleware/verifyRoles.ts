import { Request, Response, NextFunction } from 'express';

interface CustomRequest extends Request {
  roles?: number[];
}

const verifyRoles = (...allowedRoles: number[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction): void => {
    if (!req.roles) {
      res.sendStatus(401); // Unauthorized
      return;
    }

    const rolesArray = [...allowedRoles];
    const hasRole = req.roles.some((role) => rolesArray.includes(role)); // Check if any role matches

    if (!hasRole) {
      res.sendStatus(401); // Unauthorized
      return;
    }

    next(); // Proceed to the next middleware or route handler
  };
};

export default verifyRoles;
