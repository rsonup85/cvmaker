/**
 * CVMaker AI - Express Server Entry Point (Local Dev & Production)
 * Runs on Port 3000 with Vite middleware in dev and static files in prod.
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import serverApiHandler from './api/server.js';
import razorpayWebhookHandler from './api/razorpay-webhook.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Body parsers
  app.use('/api/razorpay-webhook', express.raw({ type: '*/*' }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Mount API Endpoints directly using the serverless handlers
  app.all('/api/server', (req, res) => {
    return serverApiHandler(req, res);
  });

  app.all('/api/razorpay-webhook', (req, res) => {
    return razorpayWebhookHandler(req, res);
  });

  if (!isProd) {
    // Development mode: Mount Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static files
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CVMaker AI] Server running on http://0.0.0.0:${PORT} (Mode: ${isProd ? 'Production' : 'Development'})`);
  });
}

startServer().catch((err) => {
  console.error('[CVMaker AI] Failed to start server:', err);
  process.exit(1);
});
