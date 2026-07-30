import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 5173);
const types = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.ico', 'image/x-icon']
]);

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const normalized = path.normalize(decoded).replace(/^([.][.][\/\\])+/, '');
  return path.join(__dirname, normalized === '/' ? 'index.html' : normalized);
}

const server = http.createServer((req, res) => {
  let filePath = safePath(req.url || '/');
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = path.join(__dirname, 'index.html');
  }
  const ext = path.extname(filePath).toLowerCase();
  res.setHeader('Content-Type', types.get(ext) || 'application/octet-stream');
  createReadStream(filePath).pipe(res);
});

server.listen(port, () => console.log(`Front Service Desk em http://localhost:${port}`));
