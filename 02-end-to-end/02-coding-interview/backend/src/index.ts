import { createServer } from 'http';
import { app } from './app.js';
import { createSocketServer } from './socket.js';
import 'dotenv/config';

const PORT = process.env.PORT || 3001;

const httpServer = createServer(app);
const io = createSocketServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server ready`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  io.close();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export { httpServer, io };
