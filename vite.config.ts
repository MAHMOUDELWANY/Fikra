import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'photo-upload-handler',
        configureServer(server) {
          server.middlewares.use('/api/upload-photo', (req, res) => {
            if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', () => {
                try {
                  const data = JSON.parse(body);
                  if (data.image && typeof data.image === 'string' && data.image.startsWith('data:image/')) {
                    const base64Data = data.image.replace(/^data:image\/\w+;base64,/, '');
                    const buffer = Buffer.from(base64Data, 'base64');
                    const pubDir = path.resolve(__dirname, 'public');
                    if (!fs.existsSync(pubDir)) {
                      fs.mkdirSync(pubDir, { recursive: true });
                    }
                    fs.writeFileSync(path.resolve(pubDir, 'mahmoud.jpg'), buffer);
                    fs.writeFileSync(path.resolve(pubDir, 'IMG_20260809_132258_580.jpg'), buffer);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: true }));
                    return;
                  }
                } catch (err) {
                  console.error('Error saving image:', err);
                }
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Failed to save image' }));
              });
            } else {
              res.statusCode = 404;
              res.end();
            }
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
