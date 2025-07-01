import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string | JwtPayload;
}

export const UserMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log("token..", token);

    if (!token) {
      res.status(400).json({
        message: "Bad token Request"
      });
      return;
    }

    // Use the correct secret
    if (!process.env.JWT_USER_SECRET) {
      res.status(500).json({
        message: "server internal problem"
      });
      return;
    }

    // Decode token
    const decoded = jwt.verify(token, process.env.JWT_USER_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({
      message: `Invalid or expired token ${err}`
    });
    return;
  }
};