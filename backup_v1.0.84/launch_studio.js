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

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);

  // API endpoint for web-based update trigger
  if (reqPath === '/api/check-update') {
    try {
      const LaserMaketUpdater = require('./updater.js');
      const updater = new LaserMaketUpdater();
      const resData = updater.syncToInstalledApps();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(resData));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  const filePath = path.join(ROOT, reqPath);

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

server.listen(PORT, () => {
  console.log(`LaserMaket Studio ishga tushdi: http://localhost:${PORT}`);
  console.log(`AI Erkin Generator: http://localhost:${PORT}/tools/ai-erkin-generator.html`);
});
