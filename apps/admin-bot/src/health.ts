import { createServer } from 'http';

const PORT = process.env.PORT || 10000;

const server = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      bot: 'Ale Kircha Admin Bot',
      timestamp: new Date().toISOString()
    }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`🟢 Health check server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('🛑 Server shutting down...');
    process.exit(0);
  });
});
