import { Response, NextFunction } from "express";
import { AuthRequest } from "./authenticate";

export const requireVerifiedEmail = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user?.isEmailVerified) {
    res
      .status(403)
      .json({ error: "Please verify your email to perform this action" });
    return;
  }
  next();
};
