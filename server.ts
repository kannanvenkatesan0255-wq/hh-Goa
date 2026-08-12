import express from 'express';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

interface ShareRecord {
  id: string;
  name: string;
  date: string;
  imageBuffer: Buffer;
  createdAt: number;
}

const shareStore = new Map<string, ShareRecord>();

// Cleanup old share records (older than 7 days)
setInterval(() => {
  const now = Date.now();
  for (const [id, record] of shareStore.entries()) {
    if (now - record.createdAt > 7 * 24 * 60 * 60 * 1000) {
      shareStore.delete(id);
    }
  }
}, 60 * 60 * 1000);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));

  // Helper to resolve host URL
  const getHostUrl = (req: express.Request) => {
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    return `${proto}://${host}`;
  };

  // 1. Save generated image and get share URL
  app.post('/api/share', (req, res) => {
    try {
      const { imageBase64, name, date } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: 'Missing imageBase64 payload' });
      }

      // Generate unique random share ID
      const id = crypto.randomBytes(4).toString('hex');

      // Strip data URL header
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');

      const record: ShareRecord = {
        id,
        name: name || 'Passenger',
        date: date || '11 – 13 DEC 2026',
        imageBuffer,
        createdAt: Date.now(),
      };

      shareStore.set(id, record);

      const baseUrl = getHostUrl(req);
      const shareUrl = `${baseUrl}/share/${id}`;
      const imageUrl = `${baseUrl}/api/share-image/${id}.png`;

      return res.json({
        success: true,
        id,
        shareUrl,
        imageUrl,
        name: record.name,
        date: record.date,
      });
    } catch (err) {
      console.error('Failed to create share record:', err);
      return res.status(500).json({ error: 'Failed to process share image' });
    }
  });

  // 2. Direct PNG Image endpoint for OG tags & direct view
  app.get('/api/share-image/:id.png', (req, res) => {
    const { id } = req.params;
    const record = shareStore.get(id);

    if (!record) {
      return res.status(404).send('Boarding pass image not found');
    }

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.send(record.imageBuffer);
  });

  // 3. Get share metadata JSON
  app.get('/api/share-data/:id', (req, res) => {
    const { id } = req.params;
    const record = shareStore.get(id);

    if (!record) {
      return res.status(404).json({ error: 'Share record not found' });
    }

    const baseUrl = getHostUrl(req);
    return res.json({
      id: record.id,
      name: record.name,
      date: record.date,
      shareUrl: `${baseUrl}/share/${record.id}`,
      imageUrl: `${baseUrl}/api/share-image/${record.id}.png`,
    });
  });

  // 4. Public Share HTML page with server-injected Open Graph & Twitter meta tags
  app.get('/share/:id', async (req, res, next) => {
    const { id } = req.params;
    const record = shareStore.get(id);
    const baseUrl = getHostUrl(req);

    const title = record ? `HH Goa 2026 Boarding Pass — ${record.name}` : 'HH Goa 2026 Boarding Pass';
    const description = record
      ? `Boarding pass secured for ${record.date}! See you in Goa, ${record.name}! #FrameInGoa`
      : 'My boarding pass to Hacker House Goa 2026. #FrameInGoa';
    const imageUrl = record ? `${baseUrl}/api/share-image/${id}.png` : `${baseUrl}/api/share-image/${id}.png`;
    const shareUrl = `${baseUrl}/share/${id}`;

    let templatePath = path.join(process.cwd(), 'index.html');
    if (process.env.NODE_ENV === 'production') {
      templatePath = path.join(process.cwd(), 'dist', 'index.html');
    }

    try {
      let html = fs.readFileSync(templatePath, 'utf-8');

      const metaTags = `
        <title>${title}</title>
        <meta property="og:title" content="${title}" />
        <meta property="og:description" content="${description}" />
        <meta property="og:image" content="${imageUrl}" />
        <meta property="og:image:width" content="1600" />
        <meta property="og:image:height" content="960" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="${shareUrl}" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${title}" />
        <meta name="twitter:description" content="${description}" />
        <meta name="twitter:image" content="${imageUrl}" />
      `;

      html = html.replace('</head>', `${metaTags}\n</head>`);

      if (process.env.NODE_ENV !== 'production' && viteServer) {
        html = await viteServer.transformIndexHtml(req.originalUrl, html);
      }

      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    } catch (err) {
      console.error('Error handling /share route:', err);
      next();
    }
  });

  // Vite development middleware vs production static files
  let viteServer: any = null;
  if (process.env.NODE_ENV !== 'production') {
    viteServer = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(viteServer.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
