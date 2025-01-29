'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const jsonwebtoken_1 = __importDefault(require('jsonwebtoken'));
const verifyJWT = (req, res, next) => {
  const authHeader = req.cookies.accessToken;
  if (!authHeader) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  jsonwebtoken_1.default.verify(
    authHeader,
    process.env.ACCESS_TOKEN_SECRET,
    (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid Token' });
      }
      const { UserInfo } = decoded;
      req.roles = UserInfo.roles;
      req.userId = UserInfo.id;
      req.user = {
        userId: UserInfo.id,
        roles: UserInfo.roles,
      };
      next();
    }
  );
};
exports.default = verifyJWT;
