import { Session, SessionData, Participant } from './types.js';
import { customAlphabet } from 'nanoid';
import { supabase } from './lib/supabase.js';

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

class SessionStore {
  // Cache active sessions in memory for performance, but sync with DB
  // For this implementation, we will fetch from DB to ensure persistence

  async createSession(language: string = 'javascript', title: string = 'Untitled Session', user?: { username: string, email: string }): Promise<Session | null> {
    const code = generateCode();
    const content = DEFAULT_TEMPLATES[language] || DEFAULT_TEMPLATES.javascript;

    let interviewerId = null;

    if (user) {
      // Find or create user
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();

      if (existingUser) {
        interviewerId = existingUser.id;
      } else {
        const { data: newUser } = await supabase
          .from('users')
          .insert({ username: user.username, email: user.email })
          .select('id')
          .single();
        if (newUser) interviewerId = newUser.id;
      }
    }

    const { data: session, error } = await supabase
      .from('interview_sessions')
      .insert({
        code,
        title,
        language,
        content,
        interviewer_id: interviewerId
      })
      .select()
      .single();

    if (error || !session) {
      console.error('Error creating session:', error);
      return null;
    }

    // Initialize participants as an empty Set to satisfy the Session type,
    // but live tracking is handled by ActiveSessionManager
    return {
      ...session,
      participants: new Set()
    } as Session;
  }

  async getSession(code: string): Promise<Session | null> {
    const { data: session, error } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('code', code)
      .single();

    if (error || !session) return null;

    // Note: In a real distributed system, participant tracking needs Redis. 
    // For now we re-initialize the Set if it's a new fetch, 
    // but effectively this might lose "online" status across server restarts 
    // unless we use the DB for presence (which Supabase Realtime handles on frontend).
    // For backend logic, we'll keep a basic local Set or just rely on the DB data.
    // Initialize participants as an empty Set to satisfy the Session type,
    // but live tracking is handled by ActiveSessionManager
    return {
      ...session,
      participants: new Set()
    } as Session;
  }

  async updateContent(code: string, content: string): Promise<Session | null> {
    const { data: session, error } = await supabase
      .from('interview_sessions')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('code', code)
      .select()
      .single();

    if (error || !session) return null;
    return { ...session, participants: new Set() } as Session;
  }

  async updateLanguage(code: string, language: string): Promise<Session | null> {
    const { data: session, error } = await supabase
      .from('interview_sessions')
      .update({ language, updated_at: new Date().toISOString() })
      .eq('code', code)
      .select()
      .single();

    if (error || !session) return null;
    return { ...session, participants: new Set() } as Session;
  }

  async updateTitle(code: string, title: string): Promise<Session | null> {
    const { data: session, error } = await supabase
      .from('interview_sessions')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('code', code)
      .select()
      .single();

    if (error || !session) return null;
    return { ...session, participants: new Set() } as Session;
  }

  // Participant tracking remains in-memory for basic "who is online" count
  // Candidates are persisted when they join
  async addCandidate(code: string, candidate: { name: string, email: string }): Promise<void> {
    const session = await this.getSession(code);
    if (!session) return;

    // Check if candidate exists for this session
    const { data: existing } = await supabase
      .from('candidates')
      .select('id')
      .eq('session_id', session.id)
      .eq('email', candidate.email)
      .single();

    if (!existing) {
      await supabase
        .from('candidates')
        .insert({
          name: candidate.name,
          email: candidate.email,
          session_id: session.id
        });
    }
  }

  addParticipant(code: string, participantId: string, name: string): number {
    // This is a temporary in-memory method for socket.io tracking
    // For a real stateless backend, we'd use Redis or DB presence
    // We can't easily sync this purely with the DB object without a "participants" table or presence
    // So we'll assume the session object in memory (which we just fetched/created) has the set
    // BUT, getSession returns a NEW Set() every time in my previous code!
    // I need to maintain a separate in-memory map for live participants if I want to track counts effectively across socket events
    // OR just return 0 for now if we don't care about the count accuracy without Redis.
    // Let's implement a simple static map for active sessions participants to unblock the build.
    return ActiveSessionManager.addParticipant(code, participantId, name);
  }

  removeParticipant(code: string, participantId: string): number {
    return ActiveSessionManager.removeParticipant(code, participantId);
  }

  getParticipants(code: string): Participant[] {
    return ActiveSessionManager.getParticipants(code);
  }

  // Helper for formatting
  toSessionData(session: Session): SessionData {
    // Get live count from our memory manager
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
      createdAt: new Date(session.created_at || session.createdAt).toISOString(),
      updatedAt: new Date(session.updated_at || session.updatedAt).toISOString(),
    };
  }

  async deleteSession(code: string): Promise<boolean> {
    const { error } = await supabase
      .from('interview_sessions')
      .delete()
      .eq('code', code);
    return !error;
  }

  async getAllSessions(): Promise<Session[]> {
    const { data } = await supabase.from('interview_sessions').select('*');
    return (data || []).map(s => ({ ...s, participants: new Set() } as Session));
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
      // If the map becomes empty, we can optionally delete the session entry
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
