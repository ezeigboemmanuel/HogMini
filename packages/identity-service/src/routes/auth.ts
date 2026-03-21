import { Router, Request, Response } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { requireVerifiedEmail } from '../middleware/requireVerified';

const router = Router();

// Public Routes
router.get('/github/start', AuthController.githubStart);
router.get('/github/callback', AuthController.githubCallback);
router.get('/google/start', AuthController.googleStart);
router.get('/google/callback', AuthController.googleCallback);
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/verify-email/request', AuthController.requestEmailVerification);
router.post('/verify-email', AuthController.verifyEmail);
router.post('/password-reset/request', AuthController.requestPasswordReset);
router.post('/password-reset', AuthController.resetPassword);

// Protected Routes
router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  // TODO: Expand this later to fetch the full profile from UserService. 
  res.status(200).json({ user: req.user });
});

export default router;