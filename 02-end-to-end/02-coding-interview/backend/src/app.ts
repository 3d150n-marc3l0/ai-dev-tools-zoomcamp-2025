import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { sessionStore } from './sessionStore.js';
import { CreateSessionRequest } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:8080',
  credentials: true,
}));
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, '../public');
  app.use(express.static(publicPath));
}

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create a new session
app.post('/api/sessions', async (req: Request<{}, {}, CreateSessionRequest & { username?: string, email?: string }>, res: Response) => {
  try {
    const { language = 'javascript', title = 'Untitled Session', username, email } = req.body;

    let user;
    if (username && email) {
      user = { username, email };
    }

    const session = await sessionStore.createSession(language, title, user);
    if (!session) {
      throw new Error('Failed to create session');
    }
    res.status(201).json(sessionStore.toSessionData(session));
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Join session (add candidate)
app.post('/api/sessions/:code/join', async (req: Request<{ code: string }, {}, { name: string, email: string }>, res: Response) => {
  try {
    const { code } = req.params;
    const { name, email } = req.body;

    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required' });
      return;
    }

    const session = await sessionStore.getSession(code);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    await sessionStore.addCandidate(code, { name, email });
    res.json(sessionStore.toSessionData(session));
  } catch (error) {
    console.error('Join session error:', error);
    res.status(500).json({ error: 'Failed to join session' });
  }
});

// Get session by code
app.get('/api/sessions/:code', async (req: Request<{ code: string }>, res: Response) => {
  const { code } = req.params;
  const session = await sessionStore.getSession(code);

  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  res.json(sessionStore.toSessionData(session));
});

// Get all sessions (for admin/testing)
app.get('/api/sessions', async (_req: Request, res: Response) => {
  const sessions = await sessionStore.getAllSessions();
  res.json(sessions.map(s => sessionStore.toSessionData(s)));
});

// Update session content
app.patch('/api/sessions/:code/content', async (req: Request<{ code: string }, {}, { content: string }>, res: Response) => {
  const { code } = req.params;
  const { content } = req.body;

  const session = await sessionStore.updateContent(code, content);

  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  res.json(sessionStore.toSessionData(session));
});

// Update session language
app.patch('/api/sessions/:code/language', async (req: Request<{ code: string }, {}, { language: string }>, res: Response) => {
  const { code } = req.params;
  const { language } = req.body;

  const session = await sessionStore.updateLanguage(code, language);

  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  res.json(sessionStore.toSessionData(session));
});

// Update session title
app.patch('/api/sessions/:code/title', async (req: Request<{ code: string }, {}, { title: string }>, res: Response) => {
  const { code } = req.params;
  const { title } = req.body;

  const session = await sessionStore.updateTitle(code, title);

  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  res.json(sessionStore.toSessionData(session));
});


// Delete session
app.delete('/api/sessions/:code', async (req: Request<{ code: string }>, res: Response) => {
  const { code } = req.params;
  await sessionStore.deleteSession(code);
  res.status(204).send();
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Serve index.html for any unknown routes in production (SPA support)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
  });
}

export { app };
