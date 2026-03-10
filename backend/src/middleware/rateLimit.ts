import rateLimit from 'express-rate-limit';
import config from '../config';

export const chatRateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many chat requests, please try again later.',
    retryAfter: Math.ceil(config.rateLimitWindowMs / 1000),
  },
});

export const generalRateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests * 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests, please try again later.',
    retryAfter: Math.ceil(config.rateLimitWindowMs / 1000),
  },
});
