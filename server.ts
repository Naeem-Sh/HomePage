import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import routes from './server/routes';
import { db } from './server/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security headers & basic response tuning
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Middleware for JSON & URL-encoded request parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static uploads directory with safe cache headers & stale-while-revalidate
  const paths = db.getPaths();
  if (!fs.existsSync(paths.uploadsDir)) {
    fs.mkdirSync(paths.uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(paths.uploadsDir, {
    maxAge: '1d',
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
      // Ensure browsers open PDFs, images, videos and documents inline in a new tab without forced download
      res.setHeader('Content-Disposition', 'inline');
    }
  }));

  // Mount API router FIRST
  app.use('/api', routes);

  // Terminate any unhandled /api requests with 404 JSON to prevent Vite SPA HTML fallback
  app.all('/api/*', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });

  // Global API error handling middleware ensuring JSON output
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path.startsWith('/api') || req.url.startsWith('/api')) {
      console.error('[API Error]', err);
      const statusCode = typeof err.status === 'number' ? err.status : (typeof err.statusCode === 'number' ? err.statusCode : 500);
      res.status(statusCode).json({
        error: err.message || 'خطای داخلی سرور رخ داده است'
      });
      return;
    }
    next(err);
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {}
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // Serve hashed assets with long immutable caching
    app.use('/assets', express.static(path.join(distPath, 'assets'), {
      maxAge: '1y',
      immutable: true,
      setHeaders: (res) => {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }));
    app.use(express.static(distPath, {
      maxAge: '1h',
      index: false,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, must-revalidate');
        }
      }
    }));
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Linux Homepage] Server running on http://0.0.0.0:${PORT}`);
  });

  // Graceful shutdown handling for Docker containers
  const shutdown = (signal: string) => {
    console.log(`[Linux Homepage] Received ${signal}, closing server gracefully...`);
    server.close(() => {
      console.log('[Linux Homepage] Server closed cleanly.');
      process.exit(0);
    });
    // Force shutdown after 5 seconds if graceful close hangs
    setTimeout(() => {
      console.error('[Linux Homepage] Forcefully shutting down.');
      process.exit(1);
    }, 5000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
