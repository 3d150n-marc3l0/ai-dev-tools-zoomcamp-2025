import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface Participant {
  id: string;
  name: string;
}

interface SessionData {
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

interface UseSocketSessionOptions {
  sessionCode: string;
  onContentUpdate?: (content: string, senderId: string) => void;
  onLanguageUpdate?: (language: string) => void;
  onTitleUpdate?: (title: string) => void;
  onParticipantChange?: (count: number, participants: Participant[]) => void;
  onSessionJoined?: (session: SessionData) => void;
  onError?: (message: string) => void;
}

export const useSocketSession = ({
  sessionCode,
  onContentUpdate,
  onLanguageUpdate,
  onTitleUpdate,
  onParticipantChange,
  onSessionJoined,
  onError,
}: UseSocketSessionOptions) => {
  // Use refs for callbacks to avoid re-connecting when callbacks change
  const onContentUpdateRef = useRef(onContentUpdate);
  const onLanguageUpdateRef = useRef(onLanguageUpdate);
  const onTitleUpdateRef = useRef(onTitleUpdate);
  const onParticipantChangeRef = useRef(onParticipantChange);
  const onSessionJoinedRef = useRef(onSessionJoined);
  const onErrorRef = useRef(onError);

  // Update refs when props change
  useEffect(() => {
    onContentUpdateRef.current = onContentUpdate;
    onLanguageUpdateRef.current = onLanguageUpdate;
    onTitleUpdateRef.current = onTitleUpdate;
    onParticipantChangeRef.current = onParticipantChange;
    onSessionJoinedRef.current = onSessionJoined;
    onErrorRef.current = onError;
  }, [onContentUpdate, onLanguageUpdate, onTitleUpdate, onParticipantChange, onSessionJoined, onError]);

  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

    const socket = io(serverUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      const username = localStorage.getItem('code_connect_username') || 'Anonymous';
      socket.emit('session:join', { sessionCode, username });
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('session:joined', (session: SessionData) => {
      setParticipantCount(session.participantCount);
      setParticipants(session.participants || []);
      onSessionJoinedRef.current?.(session);
    });

    socket.on('session:error', ({ message }) => {
      onErrorRef.current?.(message);
    });

    socket.on('content:updated', ({ content, senderId }) => {
      onContentUpdateRef.current?.(content, senderId);
    });

    socket.on('language:updated', ({ language }) => {
      onLanguageUpdateRef.current?.(language);
    });

    socket.on('title:updated', ({ title }) => {
      onTitleUpdateRef.current?.(title);
    });

    socket.on('participant:joined', ({ participantCount, participants }) => {
      setParticipantCount(participantCount);
      setParticipants(participants);
      onParticipantChangeRef.current?.(participantCount, participants);
    });

    socket.on('participant:left', ({ participantCount, participants }) => {
      setParticipantCount(participantCount);
      setParticipants(participants);
      onParticipantChangeRef.current?.(participantCount, participants);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [sessionCode]);

  const emitContentUpdate = useCallback((content: string) => {
    socketRef.current?.emit('content:update', { sessionCode, content });
  }, [sessionCode]);

  const emitLanguageUpdate = useCallback((language: string) => {
    socketRef.current?.emit('language:update', { sessionCode, language });
  }, [sessionCode]);

  const emitTitleUpdate = useCallback((title: string) => {
    socketRef.current?.emit('title:update', { sessionCode, title });
  }, [sessionCode]);

  return {
    connected,
    participantCount,
    participants,
    emitContentUpdate,
    emitLanguageUpdate,
    emitTitleUpdate,
  };
};
