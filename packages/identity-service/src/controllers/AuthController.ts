import { Request, Response } from "express";
import { z } from "zod";
import { LocalAuthService } from "../services/auth/LocalAuthService";
import { GoogleAuthService } from "../services/auth/GoogleAuthService";
import { GithubAuthService } from "../services/auth/GithubAuthService";

const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export class AuthController {
  static githubStart(req: Request, res: Response) {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = process.env.GITHUB_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return res.status(500).json({
        error: "GitHub OAuth is not configured",
      });
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "read:user user:email",
    });

    return res.redirect(
      `https://github.com/login/oauth/authorize?${params.toString()}`,
    );
  }

  static async githubCallback(req: Request, res: Response) {
    try {
      const code = req.query.code;
      if (typeof code !== "string" || !code) {
        return res.status(400).json({ error: "Missing GitHub auth code" });
      }

      const result = await GithubAuthService.handleGithubCallback(code);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        error: error?.message || "GitHub authentication failed",
      });
    }
  }

  static googleStart(req: Request, res: Response) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return res.status(500).json({
        error: "Google OAuth is not configured",
      });
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent",
    });

    return res.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    );
  }

  static async googleCallback(req: Request, res: Response) {
    try {
      const code = req.query.code;
      if (typeof code !== "string" || !code) {
        return res.status(400).json({ error: "Missing Google auth code" });
      }

      const result = await GoogleAuthService.handleGoogleCallback(code);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        error: error?.message || "Google authentication failed",
      });
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const { email, password } = registerSchema.parse(req.body);
      const user = await LocalAuthService.register(email, password);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await LocalAuthService.login(email, password);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  static async requestEmailVerification(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const result = await LocalAuthService.requestEmailVerification(email);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.body;
      const result = await LocalAuthService.verifyEmail(token);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const result = await LocalAuthService.requestPasswordReset(email);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;
      const result = await LocalAuthService.resetPassword(token, newPassword);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
