import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { sessionStore } from '../src/sessionStore.js';
import { supabase } from '../src/lib/supabase.js';

describe('REST API Integration Tests', () => {
  beforeEach(() => {
    // Reset DB state
    (supabase as any)._reset();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('POST /api/sessions', () => {
    it('should create a new session with default values', async () => {
      const response = await request(app)
        .post('/api/sessions')
        .send({});

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('code');
      expect(response.body.code).toMatch(/^[A-Z0-9]{6}$/);
      expect(response.body).toHaveProperty('language', 'javascript');
      expect(response.body).toHaveProperty('title', 'Untitled Session');
      expect(response.body).toHaveProperty('content');
      expect(response.body.content).toContain('JavaScript');
    });

    it('should create a session with specified language', async () => {
      const response = await request(app)
        .post('/api/sessions')
        .send({ language: 'python', title: 'Python Interview' });

      expect(response.status).toBe(201);
      expect(response.body.language).toBe('python');
      expect(response.body.title).toBe('Python Interview');
      expect(response.body.content).toContain('Python');
    });

    it('should return valid session identifiers', async () => {
      const response = await request(app)
        .post('/api/sessions')
        .send({});

      expect(response.body.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
      expect(response.body.code.length).toBe(6);
    });
  });

  describe('GET /api/sessions/:code', () => {
    it('should retrieve an existing session', async () => {
      // Create a session first
      const createResponse = await request(app)
        .post('/api/sessions')
        .send({ language: 'typescript' });

      const { code } = createResponse.body;

      // Retrieve it
      const getResponse = await request(app).get(`/api/sessions/${code}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.code).toBe(code);
      expect(getResponse.body.language).toBe('typescript');
    });

    it('should return 404 for non-existent session', async () => {
      const response = await request(app).get('/api/sessions/NOTEXIST');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Session not found');
    });
  });

  describe('GET /api/sessions', () => {
    it('should return all sessions', async () => {
      // Create multiple sessions
      await request(app).post('/api/sessions').send({ language: 'javascript' });
      await request(app).post('/api/sessions').send({ language: 'python' });

      const response = await request(app).get('/api/sessions');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it('should return empty array when no sessions exist', async () => {
      const response = await request(app).get('/api/sessions');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('PATCH /api/sessions/:code/content', () => {
    it('should update session content', async () => {
      const createResponse = await request(app)
        .post('/api/sessions')
        .send({});

      const { code } = createResponse.body;
      const newContent = 'function hello() { return "world"; }';

      const updateResponse = await request(app)
        .patch(`/api/sessions/${code}/content`)
        .send({ content: newContent });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.content).toBe(newContent);
    });

    it('should return 404 for non-existent session', async () => {
      const response = await request(app)
        .patch('/api/sessions/NOTEXIST/content')
        .send({ content: 'test' });

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/sessions/:code/language', () => {
    it('should update session language', async () => {
      const createResponse = await request(app)
        .post('/api/sessions')
        .send({});

      const { code } = createResponse.body;

      const updateResponse = await request(app)
        .patch(`/api/sessions/${code}/language`)
        .send({ language: 'python' });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.language).toBe('python');
    });
  });

  describe('DELETE /api/sessions/:code', () => {
    it('should delete an existing session', async () => {
      const createResponse = await request(app)
        .post('/api/sessions')
        .send({});

      const { code } = createResponse.body;

      const deleteResponse = await request(app).delete(`/api/sessions/${code}`);
      expect(deleteResponse.status).toBe(204);

      // Verify it's deleted
      const getResponse = await request(app).get(`/api/sessions/${code}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 204 for non-existent session', async () => {
      const response = await request(app).delete('/api/sessions/NOTEXIST');
      expect(response.status).toBe(204);
    });
  });
});
