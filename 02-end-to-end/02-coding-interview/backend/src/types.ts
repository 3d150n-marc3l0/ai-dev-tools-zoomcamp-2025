export interface Session {
  id: string;
  code: string;
  title: string;
  language: string;
  content: string;
  participants: Set<string>;
  createdAt: Date | string; // Allow string from DB
  updatedAt: Date | string;
  created_at?: string; // Supabase field
  updated_at?: string; // Supabase field
  interviewer_id?: string;
}

export interface Participant {
  id: string;
  name: string;
}

export interface SessionData {
  id: string;
  code: string;
  title: string;
  language: string;
  content: string;
  participantCount: number;
  participants: Participant[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionRequest {
  language?: string;
  title?: string;
}

export interface UpdateContentPayload {
  sessionCode: string;
  content: string;
}

export interface JoinSessionPayload {
  sessionCode: string;
  username: string;
}

export interface LanguageUpdatePayload {
  sessionCode: string;
  language: string;
}

export interface TitleUpdatePayload {
  sessionCode: string;
  title: string;
}

// Socket.io event types
export interface ServerToClientEvents {
  'session:joined': (data: SessionData) => void;
  'session:error': (error: { message: string }) => void;
  'content:updated': (data: { content: string; senderId: string }) => void;
  'language:updated': (data: { language: string }) => void;
  'title:updated': (data: { title: string }) => void;

  'participant:joined': (data: { participantCount: number; participants: Participant[] }) => void;
  'participant:left': (data: { participantCount: number; participants: Participant[] }) => void;
}

export interface ClientToServerEvents {
  'session:join': (payload: JoinSessionPayload) => void;
  'content:update': (payload: UpdateContentPayload) => void;
  'language:update': (payload: LanguageUpdatePayload) => void;
  'title:update': (payload: TitleUpdatePayload) => void;
}
