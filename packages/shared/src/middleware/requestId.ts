import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestId = uuidv4();
  // Attach to request for internal use
  req.headers["x-request-id"] = requestId;
  // Send back to client
  res.setHeader("X-Request-ID", requestId);
  next();
};
