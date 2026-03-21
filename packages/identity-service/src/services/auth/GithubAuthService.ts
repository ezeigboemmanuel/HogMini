import { pool } from "../../config/database";
import { UserRepository } from "../../Repositories/UserRepositories";
import { TokenService } from "./TokenService";

type GithubTokenResponse = {
  access_token: string;
  token_type: string;
  scope: string;
};

type GithubUserProfile = {
  id: number;
  login: string;
  email: string | null;
};

type GithubEmail = {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
};

export class GithubAuthService {
  static async handleGithubCallback(code: string) {
    if (!code) {
      throw new Error("Missing GitHub authorization code");
    }

    const githubTokens = await this.exchangeCodeForTokens(code);
    const githubProfile = await this.fetchGithubUserProfile(
      githubTokens.access_token,
    );

    const { email, verified } = await this.resolveGithubEmail(
      githubTokens.access_token,
      githubProfile,
    );

    const providerId = String(githubProfile.id);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      let user = await UserRepository.findByProviderIdentity(
        client,
        "github",
        providerId,
      );

      if (!user) {
        user = await UserRepository.findByEmail(client, email);
      }

      if (!user) {
        user = await UserRepository.createOAuthUser(client, email);
      }

      await UserRepository.createUserIdentity(
        client,
        user.id,
        "github",
        providerId,
      );

      await client.query("COMMIT");

      const token = TokenService.generateAuthToken(
        user.id,
        user.email,
        verified || user.is_email_verified,
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
  ): Promise<GithubTokenResponse> {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    const redirectUri = process.env.GITHUB_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error("GitHub OAuth environment variables are not configured");
    }

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    });

    const response = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error("Failed to exchange GitHub auth code: " + errorText);
    }

    const tokens = (await response.json()) as
      | GithubTokenResponse
      | { error: string; error_description?: string };

    if ("error" in tokens) {
      throw new Error(
        `GitHub token exchange failed: ${tokens.error}${tokens.error_description ? ` - ${tokens.error_description}` : ""}`,
      );
    }

    return tokens;
  }

  private static async fetchGithubUserProfile(
    accessToken: string,
  ): Promise<GithubUserProfile> {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: "Bearer " + accessToken,
        "User-Agent": "HogMini-Identity-Service",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error("Failed to fetch GitHub user profile: " + errorText);
    }

    return (await response.json()) as GithubUserProfile;
  }

  private static async fetchGithubEmails(
    accessToken: string,
  ): Promise<GithubEmail[]> {
    const response = await fetch("https://api.github.com/user/emails", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: "Bearer " + accessToken,
        "User-Agent": "HogMini-Identity-Service",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error("Failed to fetch GitHub user emails: " + errorText);
    }

    return (await response.json()) as GithubEmail[];
  }

  private static async resolveGithubEmail(
    accessToken: string,
    profile: GithubUserProfile,
  ) {
    if (profile.email) {
      return { email: profile.email, verified: true };
    }

    const emails = await this.fetchGithubEmails(accessToken);

    const primaryVerified = emails.find(
      (email) => email.primary && email.verified,
    );
    if (primaryVerified) {
      return { email: primaryVerified.email, verified: true };
    }

    const anyVerified = emails.find((email) => email.verified);
    if (anyVerified) {
      return { email: anyVerified.email, verified: true };
    }

    const fallback = emails[0];
    if (!fallback) {
      throw new Error("GitHub account does not expose an email address");
    }

    return { email: fallback.email, verified: false };
  }
}
