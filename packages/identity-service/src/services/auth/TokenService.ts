import jwt from "jsonwebtoken";
import { UnauthorizedError } from "@hogmini/shared";
import crypto from "crypto";

export class TokenService {
  // ==========================================
  // JWT SESSION LOGIC (For Logging In)
  // ==========================================
  static generateAuthToken(userId: string, email: string, isEmailVerified: boolean) {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const payload = { sub: userId, email, isEmailVerified };
    return jwt.sign(payload, jwtSecret, { expiresIn: "24h" });
  }

  /**
   * Verify an incoming JWT
   */
  static verifyToken(token: string) {
    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) throw new Error("JWT_SECRET is not configured");

      return jwt.verify(token, jwtSecret);
    } catch (error) {
      throw new UnauthorizedError("Invalid or expired token");
    }
  }

  // ==========================================
  // SECURE HEX LOGIC (For Resets & Verification)
  // ==========================================

  /**
   * Generates a cryptographically secure random token and its SHA-256 hash.
   * Default expiration is set to 15 minutes.
   */
  static generateSecureToken(expirationMinutes: number = 15) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);

    return {
      rawToken,
      tokenHash,
      expiresAt,
    };
  }

  /**
   * Hashes an incoming raw token so it can be compared against the database.
   */
  static hashToken(rawToken: string) {
    return crypto.createHash("sha256").update(rawToken).digest("hex");
  }
}
