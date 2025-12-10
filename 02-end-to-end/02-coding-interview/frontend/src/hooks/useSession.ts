import { useState, useEffect, useCallback, useRef } from 'react';
import { createSessionCode, DEFAULT_CODE_TEMPLATES } from '@/lib/session';
import { useToast } from '@/hooks/use-toast';

interface Session {
  id: string;
  code: string;
  title: string;
  language: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const getApiUrl = () => {
  let serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
  if (!serverUrl.startsWith('http')) {
    serverUrl = `https://${serverUrl}`;
  }
  return serverUrl;
};

export const useSession = (sessionCode?: string) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch session from backend API
  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionCode) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${getApiUrl()}/api/sessions/${sessionCode}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Session not found');
          } else {
            throw new Error('Failed to fetch session');
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setSession(data);
      } catch (err) {
        console.error('Error fetching session:', err);
        setError('Failed to load session');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionCode]);

  // Create new session via backend API
  const createSession = useCallback(async (language: string = 'javascript', title: string = 'Untitled Session') => {
    try {
      const username = localStorage.getItem('code_connect_username') || 'Anonymous';
      const email = localStorage.getItem('code_connect_email') || '';

      const response = await fetch(`${getApiUrl()}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language,
          title,
          username,
          email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error creating session:', err);
      toast({
        title: 'Error',
        description: 'Failed to create session',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  // Update session content with debounce
  const updateContent = useCallback(
    async (content: string) => {
      if (!session?.code) return;

      // Optimistic update
      setSession((prev) => prev ? { ...prev, content } : null);

      // Debounce API call
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      updateTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await fetch(`${getApiUrl()}/api/sessions/${session.code}/content`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content }),
          });

          if (!response.ok) {
            throw new Error('Failed to update content');
          }
        } catch (err) {
          console.error('Error updating content:', err);
          toast({
            title: 'Error',
            description: 'Failed to save changes',
            variant: 'destructive',
          });
        }
      }, 300);
    },
    [session?.code, toast]
  );

  // Update session language
  const updateLanguage = useCallback(
    async (language: string) => {
      if (!session?.code) return;

      try {
        const response = await fetch(`${getApiUrl()}/api/sessions/${session.code}/language`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ language }),
        });

        if (!response.ok) {
          throw new Error('Failed to update language');
        }

        setSession((prev) => prev ? { ...prev, language } : null);
      } catch (err) {
        console.error('Error updating language:', err);
        toast({
          title: 'Error',
          description: 'Failed to update language',
          variant: 'destructive',
        });
      }
    },
    [session?.code, toast]
  );

  // Update session title
  const updateTitle = useCallback(
    async (title: string) => {
      if (!session?.code) return;

      try {
        const response = await fetch(`${getApiUrl()}/api/sessions/${session.code}/title`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title }),
        });

        if (!response.ok) {
          throw new Error('Failed to update title');
        }

        setSession((prev) => prev ? { ...prev, title } : null);
      } catch (err) {
        console.error('Error updating title:', err);
        toast({
          title: 'Error',
          description: 'Failed to update title',
          variant: 'destructive',
        });
      }
    },
    [session?.code, toast]
  );

  return {
    session,
    loading,
    error,
    createSession,
    updateContent,
    updateLanguage,
    updateTitle,
  };
};
