import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export interface AppConfig {
  port: number;
  nodeEnv: string;
  corsOrigin: string;
  openaiApiKey: string;
  openaiBaseUrl: string;
  anthropicApiKey: string;
  groqApiKey: string;
  ollamaBaseUrl: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  logLevel: string;
}

const config: AppConfig = {
  port: parseInt(process.env.PORT ?? '3001', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  openaiBaseUrl: process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
  groqApiKey: process.env.GROQ_API_KEY ?? '',
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '60000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? '60', 10),
  logLevel: process.env.LOG_LEVEL ?? 'info',
};

export default config;
