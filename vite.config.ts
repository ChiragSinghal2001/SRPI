import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

function jsonStoragePlugin(): Plugin {
  return {
    name: 'vite-plugin-json-storage',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api/storage/')) {
          return next();
        }

        const collection = req.url
          .replace('/api/storage/', '')
          .split('?')[0]
          .replace(/[^a-zA-Z0-9_-]/g, '');

        if (!collection) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Collection name is required' }));
        }

        const dataDir = path.resolve(__dirname, 'src/data');
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
        const filePath = path.resolve(dataDir, `${collection}.json`);

        // Handle GET
        if (req.method === 'GET') {
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            res.setHeader('Content-Type', 'application/json');
            return res.end(content);
          } else {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: `Collection ${collection} not found` }));
          }
        }

        // Handle POST (save / overwrite collection directly to disk)
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2), 'utf8');
              res.setHeader('Content-Type', 'application/json');
              return res.end(
                JSON.stringify({
                  success: true,
                  count: Array.isArray(parsed) ? parsed.length : 1,
                  file: filePath,
                })
              );
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : 'Failed to write JSON file';
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: message }));
            }
          });
          return;
        }

        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Method not allowed' }));
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), jsonStoragePlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api/v1': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
