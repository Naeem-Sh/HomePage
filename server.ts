import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import routes from './server/routes';
import { db } from './server/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for JSON & URL-encoded request parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static uploads directory with safe cache headers
  const paths = db.getPaths();
  if (!fs.existsSync(paths.uploadsDir)) {
    fs.mkdirSync(paths.uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(paths.uploadsDir, {
    maxAge: '1d',
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }));

  // Mount API router FIRST
  app.use('/api', routes);

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
    app.use(express.static(distPath, {
      maxAge: '1h',
      index: false
    }));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Linux Homepage] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
