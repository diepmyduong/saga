import { INestApplication } from '@nestjs/common';
import helmet from 'helmet';

export function useHelmet(app: INestApplication) {
  app.use(
    helmet({
      // noSniff: false,
      // xssFilter: false,
      hidePoweredBy: true,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'https:', 'data:'],
          styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
          fontSrc: ["'self'", 'data:'],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https:'],
          connectSrc: ["'self'", 'wss:'],
          frameSrc: ["'self'"],
        },
      },
    }),
  );
}
