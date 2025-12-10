import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createSessionCode, DEFAULT_CODE_TEMPLATES } from '@/lib/session';
import { useToast } from '@/hooks/use-toast';

interface Session {
  id: string;
  code: string;
  title: string;
  language: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const useSession = (sessionCode?: string) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<string>('');

  // Fetch or create session
  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionCode) {
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('interview_sessions')
          .select('*')
          .eq('code', sessionCode)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            setError('Session not found');
          } else {
            throw fetchError;
          }
        } else {
          setSession(data);
          lastUpdateRef.current = data.content;
        }
      } catch (err) {
        console.error('Error fetching session:', err);
        setError('Failed to load session');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionCode]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!session?.id) return;

    const channel = supabase
      .channel(`session-${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'interview_sessions',
          filter: `id=eq.${session.id}`,
        },
        (payload) => {
          const newData = payload.new as Session;
          // Only update if content differs from what we last sent
          if (newData.content !== lastUpdateRef.current) {
            setSession(newData);
            lastUpdateRef.current = newData.content;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.id]);

  // Create new session
  const createSession = useCallback(async (language: string = 'javascript', title: string = 'Untitled Session') => {
    try {
      const code = createSessionCode();
      const defaultContent = DEFAULT_CODE_TEMPLATES[language] || DEFAULT_CODE_TEMPLATES.javascript;

      const { data, error: createError } = await supabase
        .from('interview_sessions')
        .insert({
          code,
          language,
          content: defaultContent,
          title,
        })
        .select()
        .single();

      if (createError) throw createError;

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
      if (!session?.id) return;

      lastUpdateRef.current = content;
      setSession((prev) => prev ? { ...prev, content } : null);

      // Debounce database updates
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      updateTimeoutRef.current = setTimeout(async () => {
        try {
          await supabase
            .from('interview_sessions')
            .update({ content })
            .eq('id', session.id);
        } catch (err) {
          console.error('Error updating content:', err);
        }
      }, 300);
    },
    [session?.id]
  );

  // Update session language
  const updateLanguage = useCallback(
    async (language: string) => {
      if (!session?.id) return;

      try {
        const { error: updateError } = await supabase
          .from('interview_sessions')
          .update({ language })
          .eq('id', session.id);

        if (updateError) throw updateError;

        setSession((prev) => prev ? { ...prev, language } : null);
      } catch (err) {
        console.error('Error updating language:', err);
      }
    },
    [session?.id]
  );

  // Update session title
  const updateTitle = useCallback(
    async (title: string) => {
      if (!session?.id) return;

      try {
        const { error: updateError } = await supabase
          .from('interview_sessions')
          .update({ title })
          .eq('id', session.id);

        if (updateError) throw updateError;

        setSession((prev) => prev ? { ...prev, title } : null);
      } catch (err) {
        console.error('Error updating title:', err);
      }
    },
    [session?.id]
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
