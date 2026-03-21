import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestId = req.headers["x-request-id"] || "unknown";

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
      requestId,
    });
  }

  // Fallback for unhandled/generic errors
  console.error(`[${requestId}] Unhandled Error:`, err);
  return res.status(500).json({
    error: "InternalServerError",
    message: "Something went wrong on our end",
    requestId,
  });
};
