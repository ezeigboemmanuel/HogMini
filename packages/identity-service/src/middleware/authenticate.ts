import { Request, Response, NextFunction } from "express";
import { TokenService } from "../services/auth/TokenService";

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res
        .status(401)
        .json({ error: "Missing or invalid Authorization header" });
      return;
    }

    const token = authHeader.split(" ")[1];

    const decoded = TokenService.verifyToken(token);

    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
