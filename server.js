const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from www.ccabchina.com directory
const staticPath = path.join(__dirname, 'www.ccabchina.com');
app.use(express.static(staticPath));

// Handle client-side routing - serve index.html for all non-file routes
app.get('*', (req, res) => {
  // If the request already has an extension, it's a file request - let static middleware handle 404
  if (path.extname(req.path) && path.extname(req.path) !== '.html') {
    res.status(404).send('Not Found');
    return;
  }
  // For SPA routes or .html files without exact match, serve index.html
  res.sendFile(path.join(staticPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
