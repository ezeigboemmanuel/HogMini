import express from 'express';
import pino from 'pino';
import pinoHttp from 'pino-http';
import authRoutes from "./routes/auth"
import dotenv from 'dotenv';

dotenv.config();

// Initialize the logger first so we can use it during startup
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: [
      'req.headers.cookie',
      'req.headers.authorization',
      'res.headers["set-cookie"]',
    ],
    censor: '[Redacted]',
  },
});

async function bootstrap() {
  try {
    const app = express();
    
    // Middleware
    app.use(express.json());
    app.use(pinoHttp({ logger }));

    const PORT = process.env.IDENTITY_PORT || 3001;

    // Health check
    app.get('/health', (req, res) => {
      res.status(200).json({ status: 'ok', service: 'identity-service' });
    });

    app.use("/auth", authRoutes)

    // Start the server
    app.listen(PORT, () => {
      logger.info(`Identity Service is running on port ${PORT}`);
    });

  } catch (error) {
    // If absolutely anything fails during startup, log it and kill the container
    logger.fatal(error, 'Failed to start Identity Service');
    process.exit(1);
  }
}

// Execute the bootstrap function
bootstrap();