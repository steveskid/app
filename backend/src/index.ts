import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import chatRouter from './routes/chat';
import modelsRouter from './routes/models';
import historyRouter from './routes/history';
import config from './config';
import logger from './utils/logger';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/chat', chatRouter);
app.use('/api/models', modelsRouter);
app.use('/api/history', historyRouter);

app.use(errorHandler);

const server = app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
});

export default server;
