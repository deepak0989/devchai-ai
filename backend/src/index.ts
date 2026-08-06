import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { config } from './config';
import adminRouter from './routes/admin';
import authRouter from './routes/auth';
import chatRouter from './routes/chats';
import settingsRouter from './routes/settings';
import agentRouter from './routes/agent';
import miniAppsRouter, { publicRouter as publicMiniAppsRouter } from './routes/miniapps';
import { maintenanceGuard } from './middleware/maintenance';

const app = express();

app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json({ limit: '3mb' }));
app.use(express.urlencoded({ extended: true, limit: '3mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'devchat-ai-backend' });
});

app.use('/api/auth', authRouter);
app.use('/api/chats', maintenanceGuard, chatRouter);
app.use('/api/agent', maintenanceGuard, agentRouter);
app.use('/api/admin', adminRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/mini-apps', maintenanceGuard, miniAppsRouter);
app.use('/api/public/mini-apps', publicMiniAppsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(config.port, () => {
  console.log(`DevChat AI backend listening on http://localhost:${config.port}`);
});
