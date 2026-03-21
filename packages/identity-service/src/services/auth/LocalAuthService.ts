import bcrypt from "bcryptjs";
import { z } from "zod";
import { pool } from "../../config/database";
import { UserRepository } from "../../Repositories/UserRepositories";
import { ConflictError, UnauthorizedError } from "@hogmini/shared";
import { TokenService } from "./TokenService";

const emailSchema = z.string().email("Invalid email format");
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");

export class LocalAuthService {
  // ==========================================
  // REGISTRATION & LOGIN
  // ==========================================
  static async register(email: string, passwordPlain: string) {
    const validatedEmail = emailSchema.parse(email);
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const existingUser = await UserRepository.findByEmail(
        client,
        validatedEmail,
      );
      if (existingUser) {
        throw new ConflictError("A user with this email already exists");
      }

      const passwordHash = await bcrypt.hash(passwordPlain, 12);
      const user = await UserRepository.create(
        client,
        validatedEmail,
        passwordHash,
      );

      await client.query("COMMIT");

      const { password_hash, ...userWithoutPassword } = user;

      const token = TokenService.generateAuthToken(
        user.id,
        user.email,
        user.is_email_verified,
      );

      LocalAuthService.requestEmailVerification(validatedEmail).catch((err) => {
        console.error(
          `Failed to generate verification email for ${validatedEmail}:`,
          err,
        );
      });

      return { token, user: userWithoutPassword };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async login(email: string, passwordPlain: string) {
    const client = await pool.connect();
    try {
      const user = await UserRepository.findByEmail(client, email);

      if (!user) throw new UnauthorizedError("Invalid credentials");

      const isPasswordValid = await bcrypt.compare(
        passwordPlain,
        user.password_hash,
      );
      if (!isPasswordValid) throw new UnauthorizedError("Invalid credentials");

      // Use the new TokenService!
      const token = TokenService.generateAuthToken(
        user.id,
        user.email,
        user.is_email_verified,
      );

      const { password_hash, ...userWithoutPassword } = user;

      return { token, user: userWithoutPassword };
    } finally {
      client.release();
    }
  }

  // ==========================================
  // PASSWORD RESET FLOW
  // ==========================================
  static async requestPasswordReset(email: string) {
    const validatedEmail = emailSchema.parse(email);
    const client = await pool.connect();

    try {
      const user = await UserRepository.findByEmail(client, validatedEmail);
      if (!user) {
        return {
          message:
            "If an account exists, a password reset email has been sent.",
        };
      }

      // Generate the secure token and its hash (expires in 15 mins)
      const { rawToken, tokenHash, expiresAt } =
        TokenService.generateSecureToken(15);

      // Save the hash to the database
      await UserRepository.savePasswordResetToken(
        client,
        user.id,
        tokenHash,
        expiresAt,
      );

      // TODO: Publish message to RabbitMQ for Notification Service
      console.log(
        `[DEV ONLY] Password reset token for ${user.email}: ${rawToken}`,
      );

      return {
        message: "If an account exists, a password reset email has been sent.",
      };
    } finally {
      client.release();
    }
  }

  static async resetPassword(rawToken: string, newPasswordPlain: string) {
    const validatedPassword = passwordSchema.parse(newPasswordPlain);
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Hash the incoming raw token so we can search the database
      const tokenHash = TokenService.hashToken(rawToken);

      // Find the user attached to this specific token
      const user = await UserRepository.findByPasswordResetToken(
        client,
        tokenHash,
      );

      if (!user) {
        throw new UnauthorizedError("Invalid or expired password reset token");
      }

      // Verify the 15-minute timer hasn't expired
      if (new Date() > new Date(user.reset_password_expires_at)) {
        throw new UnauthorizedError("Password reset token has expired");
      }

      // Hash the brand new password
      const newPasswordHash = await bcrypt.hash(validatedPassword, 12);

      // Update the password and instantly wipe the token so it can't be reused
      await UserRepository.updatePasswordAndClearToken(
        client,
        user.id,
        newPasswordHash,
      );

      await client.query("COMMIT");

      return { message: "Password has been successfully reset" };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  // ==========================================
  // EMAIL VERIFICATION FLOW
  // ==========================================
  static async requestEmailVerification(email: string) {
    const validatedEmail = emailSchema.parse(email);
    const client = await pool.connect();

    try {
      const user = await UserRepository.findByEmail(client, validatedEmail);

      // Security: Fail silently to prevent email enumeration
      if (!user) {
        return {
          message: "If an account exists, a verification email has been sent.",
        };
      }

      if (user.is_email_verified) {
        return { message: "Email is already verified." };
      }

      // Generate the secure token (Expires in 24 hours / 1440 minutes)
      const { rawToken, tokenHash, expiresAt } =
        TokenService.generateSecureToken(24 * 60);

      // Save the hash to the database
      await UserRepository.saveEmailVerificationToken(
        client,
        user.id,
        tokenHash,
        expiresAt,
      );

      // TODO: Publish message to RabbitMQ for Notification Service
      console.log(
        `[DEV ONLY] Email verification token for ${user.email}: ${rawToken}`,
      );

      return {
        message: "If an account exists, a verification email has been sent.",
      };
    } finally {
      client.release();
    }
  }

  static async verifyEmail(rawToken: string) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Hash the incoming raw token
      const tokenHash = TokenService.hashToken(rawToken);

      // Find the user attached to this specific token
      const user = await UserRepository.findByEmailVerificationToken(
        client,
        tokenHash,
      );

      if (!user) {
        throw new UnauthorizedError(
          "Invalid or expired email verification token",
        );
      }

      // Verify the 24-hour timer hasn't expired
      if (new Date() > new Date(user.verify_email_expires_at)) {
        throw new UnauthorizedError("Email verification token has expired");
      }

      // Mark the email as verified and wipe the token
      await UserRepository.markEmailAsVerified(client, user.id);

      await client.query("COMMIT");

      const upgradedToken = TokenService.generateAuthToken(
        user.id,
        user.email,
        true,
      );

      return {
        message: "Email has been successfully verified",
        token: upgradedToken,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
