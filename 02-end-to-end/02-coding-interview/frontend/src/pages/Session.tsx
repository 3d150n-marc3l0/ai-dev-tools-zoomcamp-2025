import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { useSession } from '@/hooks/useSession';
import { useSocketSession } from '@/hooks/useSocketSession';
import SessionHeader from '@/components/SessionHeader';
import UserPanel from '@/components/UserPanel';
import CodeEditor from '@/components/CodeEditor';
import CodeOutput from '@/components/CodeOutput';
import { Button } from '@/components/ui/button';

const Session = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { session, loading, error, updateContent, updateLanguage, updateTitle } = useSession(code);
  const [showUserPanel, setShowUserPanel] = useState(false);

  // Socket connection for real-time collab
  const {
    participantCount,
    participants,
    emitContentUpdate,
    emitLanguageUpdate,
    emitTitleUpdate
  } = useSocketSession({
    sessionCode: code || '',
    onContentUpdate: (newContent) => updateContent(newContent), // Sync socket -> local/db
    onLanguageUpdate: (newLang) => updateLanguage(newLang),
    onTitleUpdate: (newTitle) => updateTitle(newTitle),
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">Session Not Found</h1>
          <p className="mb-6 text-muted-foreground">
            The session you're looking for doesn't exist or has expired.
          </p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <SessionHeader
        sessionCode={session.code}
        title={session.title}
        language={session.language}
        username={localStorage.getItem('code_connect_username') || 'Anonymous'}
        participantCount={participantCount}

        onTitleChange={(t) => { updateTitle(t); emitTitleUpdate(t); }}
        onLanguageChange={(l) => { updateLanguage(l); emitLanguageUpdate(l); }}
        onToggleUsers={() => setShowUserPanel(!showUserPanel)}
      />

      <div className="flex flex-1 gap-4 overflow-hidden p-4">
        {/* Code Editor - Takes 2/3 of the space */}
        <div className="flex-[2] min-w-0">
          <CodeEditor
            value={session.content}
            language={session.language}
            onChange={(c) => { updateContent(c); emitContentUpdate(c); }}
          />
        </div>

        {/* Output Panel - Takes 1/3 of the space */}
        <div className="flex-1 min-w-[300px] flex gap-4">
          <div className="flex-1 min-w-0">
            <CodeOutput code={session.content} language={session.language} />
          </div>

          {showUserPanel && (
            <UserPanel
              participants={participants}
              onClose={() => setShowUserPanel(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Session;
