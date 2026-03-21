import { pool } from "../../config/database";
import { UserRepository } from "../../Repositories/UserRepositories";
import { TokenService } from "./TokenService";

type GoogleTokenResponse = {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token?: string;
  refresh_token?: string;
};

type GoogleUserProfile = {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
};

export class GoogleAuthService {
  static async handleGoogleCallback(code: string) {
    if (!code) {
      throw new Error("Missing Google authorization code");
    }

    // Exchange the code for an Access Token from Google
    const googleTokens = await this.exchangeCodeForTokens(code);

    // Fetch the user's profile from Google's API
    const googleProfile = await this.fetchGoogleUserProfile(
      googleTokens.access_token,
    );

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Find an existing user linked by Google account first.
      let user = await UserRepository.findByProviderIdentity(
        client,
        "google",
        googleProfile.sub,
      );

      if (!user) {
        user = await UserRepository.findByEmail(client, googleProfile.email);
      }

      if (!user) {
        // Create new user (automatically verified)
        user = await UserRepository.createOAuthUser(
          client,
          googleProfile.email,
        );
      }

      await UserRepository.createUserIdentity(
        client,
        user.id,
        "google",
        googleProfile.sub,
      );

      await client.query("COMMIT");

      // Generate the standard HogMini session token
      const token = TokenService.generateAuthToken(
        user.id,
        user.email,
        user.is_email_verified,
      );

      return { token, user };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  private static async exchangeCodeForTokens(
    code: string,
  ): Promise<GoogleTokenResponse> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error("Google OAuth environment variables are not configured");
    }

    const body = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error("Failed to exchange Google auth code: " + errorText);
    }

    return (await response.json()) as GoogleTokenResponse;
  }

  private static async fetchGoogleUserProfile(
    accessToken: string,
  ): Promise<GoogleUserProfile> {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error("Failed to fetch Google user profile: " + errorText);
    }

    const profile = (await response.json()) as GoogleUserProfile;

    if (!profile.email || !profile.sub) {
      throw new Error("Google profile is missing required fields");
    }

    return profile;
  }
}
