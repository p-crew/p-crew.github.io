import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const publicFiles = new Set(['index.html', 'styles.css', 'script.js', 'robots.txt', 'sitemap.xml']);
const port = Number(process.env.PORT || 4173);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
};

const server = http.createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end('Method not allowed');
    return;
  }
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const requestedPath = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    const relativePath = path.relative(root, requestedPath);
    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    if (!publicFiles.has(relativePath) && !/^assets[\\/]/.test(relativePath)) {
      response.writeHead(404).end('Not found');
      return;
    }
    if (!(await stat(requestedPath)).isFile()) {
      response.writeHead(404).end('Not found');
      return;
    }
    const content = await readFile(requestedPath);
    response.writeHead(200, {
      'Content-Type': types[path.extname(requestedPath)] || 'application/octet-stream',
      'Content-Length': content.length,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store',
    });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch (error) {
    response.writeHead(error.code === 'ENOENT' ? 404 : 400).end('Not found');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Peter Crew — http://127.0.0.1:${port}`);
});
server.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
