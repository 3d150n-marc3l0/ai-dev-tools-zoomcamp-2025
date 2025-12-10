import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { sessionStore } from './sessionStore.js';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  JoinSessionPayload,
  UpdateContentPayload,
  LanguageUpdatePayload,
  TitleUpdatePayload,
} from './types.js';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export function createSocketServer(httpServer: HttpServer): Server<ClientToServerEvents, ServerToClientEvents> {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: TypedSocket) => {
    console.log(`Client connected: ${socket.id}`);

    // Track which session this socket is in
    let currentSessionCode: string | null = null;

    socket.on('session:join', async (payload: JoinSessionPayload) => {
      const { sessionCode, username } = payload;
      const session = await sessionStore.getSession(sessionCode);

      if (!session) {
        socket.emit('session:error', { message: 'Session not found' });
        return;
      }

      // Leave previous session if any
      if (currentSessionCode) {
        socket.leave(currentSessionCode);
        const count = sessionStore.removeParticipant(currentSessionCode, socket.id);
        const participants = sessionStore.getParticipants(currentSessionCode);
        io.to(currentSessionCode).emit('participant:left', { participantCount: count, participants });
      }

      // Join new session
      currentSessionCode = sessionCode;
      socket.join(sessionCode);
      const participantCount = sessionStore.addParticipant(sessionCode, socket.id, username || 'Anonymous');
      const participants = sessionStore.getParticipants(sessionCode);

      // Send session data to the joining client
      socket.emit('session:joined', sessionStore.toSessionData(session));

      // Notify others about new participant
      socket.to(sessionCode).emit('participant:joined', { participantCount, participants });
    });

    socket.on('content:update', async (payload: UpdateContentPayload) => {
      const { sessionCode, content } = payload;
      const session = await sessionStore.updateContent(sessionCode, content);

      if (session) {
        // Broadcast to all other clients in the session
        socket.to(sessionCode).emit('content:updated', {
          content,
          senderId: socket.id,
        });
      }
    });

    socket.on('language:update', async (payload: LanguageUpdatePayload) => {
      const { sessionCode, language } = payload;
      const session = await sessionStore.updateLanguage(sessionCode, language);

      if (session) {
        socket.to(sessionCode).emit('language:updated', { language });
      }
    });

    socket.on('title:update', async (payload: TitleUpdatePayload) => {
      const { sessionCode, title } = payload;
      const session = await sessionStore.updateTitle(sessionCode, title);

      if (session) {
        socket.to(sessionCode).emit('title:updated', { title });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);

      if (currentSessionCode) {
        const count = sessionStore.removeParticipant(currentSessionCode, socket.id);
        const participants = sessionStore.getParticipants(currentSessionCode);
        io.to(currentSessionCode).emit('participant:left', { participantCount: count, participants });
      }
    });
  });

  return io;
}
