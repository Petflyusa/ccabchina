const { createServer } = require('http');
const { parse } = require('url');
const { readFile, stat } = require('fs').promises;
const { existsSync } = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

async function handler(req, res) {
  const { pathname } = parse(req.url);

  // Default to index.html
  let filePath = pathname === '/'
    ? path.join(PUBLIC_DIR, 'index.html')
    : path.join(PUBLIC_DIR, pathname);

  // Remove trailing slash for cleaner paths
  filePath = filePath.replace(/\/$/, '');

  // Try .html extension if no extension present
  if (!path.extname(filePath)) {
    const withHtml = filePath + '.html';
    if (existsSync(withHtml)) {
      filePath = withHtml;
    }
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  try {
    const statResult = await stat(filePath);
    if (statResult.isDirectory()) {
      const withIndex = path.join(filePath, 'index.html');
      if (existsSync(withIndex)) {
        filePath = withIndex;
      } else {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
    }

    const content = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (err) {
    // Try index.html as fallback (SPA support)
    const indexFallback = path.join(PUBLIC_DIR, 'index.html');
    if (existsSync(indexFallback) && path.extname(filePath) === '.html') {
      const content = await readFile(indexFallback);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
      return;
    }
    res.writeHead(404);
    res.end('Not Found');
  }
}

module.exports = handler;
module.exports.handler = handler;
