import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { sessionStore } from './sessionStore.js';
import { CreateSessionRequest } from './types.js';
import { swaggerSpec, swaggerUi } from './swagger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:8080',
  credentials: true,
}));
app.use(express.json());

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Code Connect Live API Docs',
}));

// Serve OpenAPI spec as JSON
app.get('/api-docs.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});



/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Health check endpoint
 *     description: Returns the current health status of the API
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * @openapi
 * /api/sessions:
 *   post:
 *     tags:
 *       - Sessions
 *     summary: Create a new coding session
 *     description: Creates a new collaborative coding session with a unique 6-character code
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSessionRequest'
 *     responses:
 *       201:
 *         description: Session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Session'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @openapi
 * /api/sessions/{code}/join:
 *   post:
 *     tags:
 *       - Sessions
 *     summary: Join a session as a candidate
 *     description: Adds a candidate to an existing session
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[A-Z0-9]{6}$'
 *         description: 6-character session code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JoinSessionRequest'
 *     responses:
 *       200:
 *         description: Successfully joined session
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Session'
 *       400:
 *         description: Invalid request (missing name or email)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @openapi
 * /api/sessions/{code}:
 *   get:
 *     tags:
 *       - Sessions
 *     summary: Get session by code
 *     description: Retrieves session details using the 6-character session code
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[A-Z0-9]{6}$'
 *         description: 6-character session code
 *     responses:
 *       200:
 *         description: Session found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Session'
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/sessions/:code', async (req: Request<{ code: string }>, res: Response) => {
  const { code } = req.params;
  const session = await sessionStore.getSession(code);

  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  res.json(sessionStore.toSessionData(session));
});

/**
 * @openapi
 * /api/sessions:
 *   get:
 *     tags:
 *       - Sessions
 *     summary: Get all sessions
 *     description: Retrieves a list of all active sessions (for admin/testing purposes)
 *     responses:
 *       200:
 *         description: List of all sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Session'
 */
app.get('/api/sessions', async (_req: Request, res: Response) => {
  const sessions = await sessionStore.getAllSessions();
  res.json(sessions.map(s => sessionStore.toSessionData(s)));
});

/**
 * @openapi
 * /api/sessions/{code}/content:
 *   patch:
 *     tags:
 *       - Sessions
 *     summary: Update session code content
 *     description: Updates the code content of a session
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[A-Z0-9]{6}$'
 *         description: 6-character session code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateContentRequest'
 *     responses:
 *       200:
 *         description: Content updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Session'
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @openapi
 * /api/sessions/{code}/language:
 *   patch:
 *     tags:
 *       - Sessions
 *     summary: Update session programming language
 *     description: Changes the programming language for a session
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[A-Z0-9]{6}$'
 *         description: 6-character session code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateLanguageRequest'
 *     responses:
 *       200:
 *         description: Language updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Session'
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @openapi
 * /api/sessions/{code}/title:
 *   patch:
 *     tags:
 *       - Sessions
 *     summary: Update session title
 *     description: Changes the title of a session
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[A-Z0-9]{6}$'
 *         description: 6-character session code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTitleRequest'
 *     responses:
 *       200:
 *         description: Title updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Session'
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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


/**
 * @openapi
 * /api/sessions/{code}:
 *   delete:
 *     tags:
 *       - Sessions
 *     summary: Delete a session
 *     description: Permanently deletes a session and all its data
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[A-Z0-9]{6}$'
 *         description: 6-character session code
 *     responses:
 *       204:
 *         description: Session deleted successfully (no content)
 */
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

// Production mode: Serve static files and handle SPA routing
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, '../public');

  // Serve static files (CSS, JS, images, etc.)
  app.use(express.static(publicPath));

  // SPA fallback: serve index.html for any unknown routes
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
  });
}

export { app };
