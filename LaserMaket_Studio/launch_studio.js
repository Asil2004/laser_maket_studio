const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3800;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.dxf': 'application/dxf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.stl': 'application/octet-stream',
  '.zip': 'application/zip'
};

const server = http.createServer(async (req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);

  // API endpoint: Yangilanishni tekshirish va o'rnatish
  if (reqPath === '/api/update-now' || reqPath === '/api/check-update') {
    try {
      const LaserMaketUpdater = require('./updater.js');
      const updater = new LaserMaketUpdater();
      const result = await updater.checkInternetUpdate();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // API endpoint: Joriy versiyani olish
  if (reqPath === '/api/version') {
    let ver = '1.0.87';
    try {
      const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'updater-config.json'), 'utf8'));
      if (cfg && cfg.currentVersion) ver = cfg.currentVersion;
    } catch (e) {}
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ version: ver }));
    return;
  }

  // Claude API ko'prigi (AI generator -> Claude -> professional generator)
  if (reqPath.startsWith('/api/claude/')) {
    require('./claude_bridge.js').handle(req, res, reqPath);
    return;
  }
  if (/claude-config|\.images\.json$/i.test(reqPath)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403');
    return;
  }

  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  const filePath = path.join(ROOT, reqPath);
  if (!path.resolve(filePath).startsWith(path.resolve(ROOT))) { res.writeHead(403); res.end('403'); return; }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, { 'Content-Type': mime });
  fs.createReadStream(filePath).pipe(res);
});

try { require('./claude_bridge.js').rebuildAll(); } catch (e) { console.error('custom/all.js:', e.message); }
server.listen(PORT, () => {
  console.log(`LaserMaket Studio ishga tushdi: http://localhost:${PORT}`);
  console.log(`AI Erkin Generator: http://localhost:${PORT}/tools/ai-erkin-generator.html`);
});
