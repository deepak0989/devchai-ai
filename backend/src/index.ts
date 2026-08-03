import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { config } from './config';
import authRouter from './routes/auth';
import chatRouter from './routes/chats';

const app = express();

app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'devchat-ai-backend' });
});

app.use('/api/auth', authRouter);
app.use('/api/chats', chatRouter);

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
