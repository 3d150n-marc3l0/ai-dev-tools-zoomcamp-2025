import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as ioc, Socket as ClientSocket } from 'socket.io-client';
import { app } from '../src/app.js';
import { createSocketServer } from '../src/socket.js';
import { sessionStore } from '../src/sessionStore.js';
import { SessionData } from '../src/types.js';

describe('WebSocket Integration Tests', () => {
  let httpServer: ReturnType<typeof createServer>;
  let io: Server;
  let clientSocket1: ClientSocket;
  let clientSocket2: ClientSocket;
  const TEST_PORT = 3099;

  beforeAll(() => {
    return new Promise<void>((resolve) => {
      httpServer = createServer(app);
      io = createSocketServer(httpServer);
      httpServer.listen(TEST_PORT, () => {
        resolve();
      });
    });
  });

  afterAll(() => {
    return new Promise<void>((resolve) => {
      io.close();
      httpServer.close(() => resolve());
    });
  });

  beforeEach(() => {
    // sessionStore.clear(); // Removed for DB-backed store

    // Disconnect any existing sockets
    if (clientSocket1?.connected) clientSocket1.disconnect();
    if (clientSocket2?.connected) clientSocket2.disconnect();
  });

  const createClient = (): ClientSocket => {
    return ioc(`http://localhost:${TEST_PORT}`, {
      transports: ['websocket'],
      autoConnect: false,
    });
  };

  describe('Connection', () => {
    it('should connect to WebSocket server', () => {
      return new Promise<void>((resolve) => {
        clientSocket1 = createClient();

        clientSocket1.on('connect', () => {
          expect(clientSocket1.connected).toBe(true);
          clientSocket1.disconnect();
          resolve();
        });

        clientSocket1.connect();
      });
    });
  });

  describe('Session Join', () => {
    it('should join an existing session', async () => {
      const session = await sessionStore.createSession('javascript', 'Test Session');
      if (!session) throw new Error('Session creation failed');

      await new Promise<void>((resolve) => {
        clientSocket1 = createClient();

        clientSocket1.on('session:joined', (data: SessionData) => {
          expect(data.code).toBe(session.code);
          expect(data.title).toBe('Test Session');
          expect(data.language).toBe('javascript');
          clientSocket1.disconnect();
          resolve();
        });

        clientSocket1.connect();
        clientSocket1.emit('session:join', { sessionCode: session.code });
      });
    });

    it('should emit error when joining non-existent session', () => {
      return new Promise<void>((resolve) => {
        clientSocket1 = createClient();

        clientSocket1.on('session:error', (error) => {
          expect(error.message).toBe('Session not found');
          clientSocket1.disconnect();
          resolve();
        });

        clientSocket1.connect();
        clientSocket1.emit('session:join', { sessionCode: 'INVALID' });
      });
    });

    it('should notify other participants when someone joins', async () => {
      const session = await sessionStore.createSession();
      if (!session) throw new Error('Session creation failed');

      await new Promise<void>((resolve) => {
        clientSocket1 = createClient();
        clientSocket2 = createClient();

        clientSocket1.on('participant:joined', (data) => {
          expect(data.participantCount).toBe(2);
          clientSocket1.disconnect();
          clientSocket2.disconnect();
          resolve();
        });

        clientSocket1.connect();
        clientSocket1.emit('session:join', { sessionCode: session.code });

        // Wait for first client to join, then connect second
        clientSocket1.on('session:joined', () => {
          clientSocket2.connect();
          clientSocket2.emit('session:join', { sessionCode: session.code });
        });
      });
    });
  });

  describe('Real-time Collaboration', () => {
    it('should broadcast content updates to other clients', async () => {
      const session = await sessionStore.createSession();
      if (!session) throw new Error('Session creation failed');

      await new Promise<void>((resolve) => {
        clientSocket1 = createClient();
        clientSocket2 = createClient();
        const testContent = 'function test() { return 42; }';

        let client1Joined = false;
        let client2Joined = false;

        const checkBothJoined = () => {
          if (client1Joined && client2Joined) {
            // Client 1 sends content update
            clientSocket1.emit('content:update', {
              sessionCode: session.code,
              content: testContent,
            });
          }
        };

        clientSocket1.on('session:joined', () => {
          client1Joined = true;
          checkBothJoined();
        });

        clientSocket2.on('session:joined', () => {
          client2Joined = true;
          checkBothJoined();
        });

        // Client 2 should receive the content update
        clientSocket2.on('content:updated', (data) => {
          expect(data.content).toBe(testContent);
          expect(data.senderId).toBe(clientSocket1.id);
          clientSocket1.disconnect();
          clientSocket2.disconnect();
          resolve();
        });

        clientSocket1.connect();
        clientSocket2.connect();
        clientSocket1.emit('session:join', { sessionCode: session.code });
        clientSocket2.emit('session:join', { sessionCode: session.code });
      });
    });

    it('should broadcast language updates to other clients', async () => {
      const session = await sessionStore.createSession('javascript');
      if (!session) throw new Error('Session creation failed');

      await new Promise<void>((resolve) => {
        clientSocket1 = createClient();
        clientSocket2 = createClient();

        let bothJoined = 0;

        const onJoined = () => {
          bothJoined++;
          if (bothJoined === 2) {
            clientSocket1.emit('language:update', {
              sessionCode: session.code,
              language: 'python',
            });
          }
        };

        clientSocket1.on('session:joined', onJoined);
        clientSocket2.on('session:joined', onJoined);

        clientSocket2.on('language:updated', (data) => {
          expect(data.language).toBe('python');
          clientSocket1.disconnect();
          clientSocket2.disconnect();
          resolve();
        });

        clientSocket1.connect();
        clientSocket2.connect();
        clientSocket1.emit('session:join', { sessionCode: session.code });
        clientSocket2.emit('session:join', { sessionCode: session.code });
      });
    });

    it('should broadcast title updates to other clients', async () => {
      const session = await sessionStore.createSession();
      if (!session) throw new Error('Session creation failed');

      await new Promise<void>((resolve) => {
        clientSocket1 = createClient();
        clientSocket2 = createClient();

        let bothJoined = 0;

        const onJoined = () => {
          bothJoined++;
          if (bothJoined === 2) {
            clientSocket1.emit('title:update', {
              sessionCode: session.code,
              title: 'New Title',
            });
          }
        };

        clientSocket1.on('session:joined', onJoined);
        clientSocket2.on('session:joined', onJoined);

        clientSocket2.on('title:updated', (data) => {
          expect(data.title).toBe('New Title');
          clientSocket1.disconnect();
          clientSocket2.disconnect();
          resolve();
        });

        clientSocket1.connect();
        clientSocket2.connect();
        clientSocket1.emit('session:join', { sessionCode: session.code });
        clientSocket2.emit('session:join', { sessionCode: session.code });
      });
    });
  });

  describe('Participant Tracking', () => {
    it('should notify when participant leaves', async () => {
      const session = await sessionStore.createSession();
      if (!session) throw new Error('Session creation failed');

      await new Promise<void>((resolve, reject) => {
        clientSocket1 = createClient();
        clientSocket2 = createClient();

        clientSocket1.on('participant:left', (data) => {
          try {
            expect(data.participantCount).toBe(1);
            expect(data.participants).toBeDefined();
            expect(data.participants.length).toBe(1);
            clientSocket1.disconnect();
            resolve();
          } catch (error) {
            reject(error);
          }
        });

        clientSocket1.connect();
        clientSocket1.emit('session:join', { sessionCode: session.code });

        clientSocket1.on('session:joined', () => {
          clientSocket2.connect();
          clientSocket2.emit('session:join', { sessionCode: session.code });

          clientSocket2.on('session:joined', () => {
            // Disconnect client 2
            clientSocket2.disconnect();
          });
        });
      });
    });
  });
});
