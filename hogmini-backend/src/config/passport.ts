import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL 
});

const prisma = new PrismaClient({ adapter });

// Local Strategy (for login)
passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { email }
        });

        if (!user || !user.password) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        
        if (!isValid) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// JWT Strategy (for protected routes)
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET!
    },
    async (payload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId }
        });

        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const googleCallbackURL = `${process.env.BACKEND_URL}/api/auth/google/callback`;
  console.log('Google OAuth callback URL:', googleCallbackURL);
  
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: googleCallbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;

          if (!email) {
            return done(new Error('No email found in Google profile'));
          }

          // Check if user exists by Google ID
          let user = await prisma.user.findUnique({
            where: { googleId: profile.id },
          });

          if (!user) {
            // Check by email
            user = await prisma.user.findUnique({
              where: { email },
            });

            if (user) {
              // Link Google to existing account
              user = await prisma.user.update({
                where: { id: user.id },
                data: {
                  googleId: profile.id,
                  image: user.image || profile.photos?.[0]?.value,
                  emailVerified: true,
                },
              });
            } else {
              // Create new user
              user = await prisma.user.create({
                data: {
                  email,
                  name: profile.displayName,
                  googleId: profile.id,
                  image: profile.photos?.[0]?.value,
                  emailVerified: true,
                },
              });
            }
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/api/auth/github/callback`,
        scope: ['user:email'],
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: (error: Error | null, user?: any) => void
      ) => {
        try {
          const email = profile.emails?.[0]?.value;

          if (!email) {
            return done(new Error('No email found in GitHub profile. Please make sure your email is public on GitHub.'));
          }

          // Check if user exists by GitHub ID
          let user = await prisma.user.findUnique({
            where: { githubId: profile.id },
          });

          if (!user) {
            // Check by email
            user = await prisma.user.findUnique({
              where: { email },
            });

            if (user) {
              // Link GitHub to existing account
              user = await prisma.user.update({
                where: { id: user.id },
                data: {
                  githubId: profile.id,
                  image: user.image || profile.photos?.[0]?.value,
                  emailVerified: true,
                },
              });
            } else {
              // Create new user
              user = await prisma.user.create({
                data: {
                  email,
                  name: profile.displayName || profile.username,
                  githubId: profile.id,
                  image: profile.photos?.[0]?.value,
                  emailVerified: true,
                },
              });
            }
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );
}

export default passport;