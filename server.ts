import http from 'http';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { fetchWbCardData, extractWbSku } from './src/services/wbParser';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'PriceRadar RF Backend',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // Wildberries card lookup proxy endpoint
  app.get('/api/wb/:sku', async (req, res) => {
    try {
      const sku = Number(req.params.sku);
      if (!sku || isNaN(sku)) {
        return res.status(400).json({ success: false, error: 'Invalid SKU' });
      }
      const data = await fetchWbCardData(sku);
      if (data) {
        return res.json({ success: true, data });
      }
      return res.status(404).json({ success: false, error: 'WB Card not found on CDN' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Universal parse endpoint
  app.post('/api/parse-url', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ success: false, error: 'Missing url parameter' });
      }
      const sku = extractWbSku(url);
      if (sku) {
        const card = await fetchWbCardData(sku);
        if (card) {
          return res.json({ success: true, card });
        }
      }
      return res.json({ success: false, message: 'Not a WB SKU or card not found' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Telegram direct dispatch endpoint
  app.post('/api/telegram/send', async (req, res) => {
    try {
      const { botToken, chatId, message } = req.body;
      if (!botToken || !chatId || !message) {
        return res.status(400).json({ success: false, error: 'Missing botToken, chatId, or message' });
      }

      const tgUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const response = await fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
          disable_web_page_preview: false
        })
      });

      const data = await response.json();
      if (data.ok) {
        return res.json({ success: true, result: data.result });
      } else {
        return res.status(400).json({ success: false, error: data.description });
      }
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: isHmrDisabled ? false : { server },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[PriceRadar RF] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
