// Servidor estático sin dependencias para la PWA. Puerto por defecto: 4000.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch (error) {
    if (!(error instanceof URIError)) throw error;
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Solicitud no válida');
  }
  if (pathname.endsWith('/')) pathname += 'index.html';

  // Evita salir de la carpeta public (path traversal)
  const filePath = path.normalize(path.join(PUBLIC_DIR, pathname));
  const relativePath = path.relative(PUBLIC_DIR, filePath);
  if (relativePath === '..' || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath)) {
    res.writeHead(403);
    return res.end('Prohibido');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 - No encontrado');
    }
    const ext = path.extname(filePath).toLowerCase();
    const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream' };
    // El service worker y el manifest nunca deben quedar en caché HTTP,
    // para que el navegador detecte las nuevas versiones.
    if (pathname === '/sw.js' || ext === '.webmanifest') {
      headers['Cache-Control'] = 'no-cache';
    } else if (ext === '.js' || ext === '.css') {
      headers['Cache-Control'] = 'public, max-age=604800';
    }
    res.writeHead(200, headers);
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`PWA Actividades Académicas en http://localhost:${PORT}`);
});
