import { Session, SessionData, Participant } from './types.js';
import { customAlphabet } from 'nanoid';

const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const generateCode = customAlphabet(alphabet, 6);

const DEFAULT_TEMPLATES: Record<string, string> = {
  javascript: `// Welcome to the Interview Session
// Write your JavaScript code here

function solution(input) {
  // Your implementation here
  return input;
}

// Test your solution
console.log(solution("Hello, World!"));
`,
  typescript: `// Welcome to the Interview Session
// Write your TypeScript code here

function solution(input: string): string {
  // Your implementation here
  return input;
}

// Test your solution
console.log(solution("Hello, World!"));
`,
  python: `# Welcome to the Interview Session
# Write your Python code here

def solution(input):
    # Your implementation here
    return input

# Test your solution
print(solution("Hello, World!"))
`,
};

// In-memory storage for sessions
class SessionStore {
  private sessions = new Map<string, Session>();
  private sessionIdCounter = 0;

  async createSession(language: string = 'javascript', title: string = 'Untitled Session', user?: { username: string, email: string }): Promise<Session | null> {
    const code = generateCode();
    const content = DEFAULT_TEMPLATES[language] || DEFAULT_TEMPLATES.javascript;
    const now = new Date().toISOString();

    const session: Session = {
      id: `session_${++this.sessionIdCounter}`,
      code,
      title,
      language,
      content,
      createdAt: now,
      updatedAt: now,
      created_at: now,
      updated_at: now,
      interviewer_id: user ? `user_${user.email}` : undefined,
      participants: new Set()
    };

    this.sessions.set(code, session);
    console.log(`✅ Created session: ${code}`);
    return session;
  }

  async getSession(code: string): Promise<Session | null> {
    return this.sessions.get(code) || null;
  }

  async updateContent(code: string, content: string): Promise<Session | null> {
    const session = this.sessions.get(code);
    if (!session) return null;

    const now = new Date().toISOString();
    session.content = content;
    session.updatedAt = now;
    session.updated_at = now;
    return session;
  }

  async updateLanguage(code: string, language: string): Promise<Session | null> {
    const session = this.sessions.get(code);
    if (!session) return null;

    const now = new Date().toISOString();
    session.language = language;
    session.updatedAt = now;
    session.updated_at = now;
    return session;
  }

  async updateTitle(code: string, title: string): Promise<Session | null> {
    const session = this.sessions.get(code);
    if (!session) return null;

    const now = new Date().toISOString();
    session.title = title;
    session.updatedAt = now;
    session.updated_at = now;
    return session;
  }

  async addCandidate(code: string, candidate: { name: string, email: string }): Promise<void> {
    // In-memory version doesn't persist candidates separately
    console.log(`Candidate ${candidate.name} joined session ${code}`);
  }

  addParticipant(code: string, participantId: string, name: string): number {
    return ActiveSessionManager.addParticipant(code, participantId, name);
  }

  removeParticipant(code: string, participantId: string): number {
    return ActiveSessionManager.removeParticipant(code, participantId);
  }

  getParticipants(code: string): Participant[] {
    return ActiveSessionManager.getParticipants(code);
  }

  toSessionData(session: Session): SessionData {
    const liveCount = ActiveSessionManager.getCount(session.code);
    const participants = ActiveSessionManager.getParticipants(session.code);

    return {
      id: session.id,
      code: session.code,
      title: session.title,
      language: session.language,
      content: session.content,
      participantCount: liveCount,
      participants,
      createdAt: session.created_at || new Date().toISOString(),
      updatedAt: session.updated_at || new Date().toISOString(),
    };
  }

  async deleteSession(code: string): Promise<boolean> {
    return this.sessions.delete(code);
  }

  async getAllSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values());
  }
}

// Simple in-memory manager for socket participant counts
class ActiveSessionManager {
  // sessionCode -> Map<socketId, Participant>
  private static participants = new Map<string, Map<string, Participant>>();

  static addParticipant(code: string, id: string, name: string): number {
    if (!this.participants.has(code)) {
      this.participants.set(code, new Map());
    }
    const sessionParticipants = this.participants.get(code)!;
    sessionParticipants.set(id, { id, name });
    return sessionParticipants.size;
  }

  static removeParticipant(code: string, id: string): number {
    if (this.participants.has(code)) {
      const sessionParticipants = this.participants.get(code)!;
      sessionParticipants.delete(id);
      if (sessionParticipants.size === 0) {
        this.participants.delete(code);
      }
      return sessionParticipants.size;
    }
    return 0;
  }

  static getCount(code: string): number {
    return this.participants.get(code)?.size || 0;
  }

  static getParticipants(code: string): Participant[] {
    const sessionParticipants = this.participants.get(code);
    return sessionParticipants ? Array.from(sessionParticipants.values()) : [];
  }
}

export const sessionStore = new SessionStore();
export { SessionStore };
