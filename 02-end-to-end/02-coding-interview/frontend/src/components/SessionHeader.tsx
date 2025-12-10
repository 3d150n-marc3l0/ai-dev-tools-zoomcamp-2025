import { useState } from 'react';
import { Link, Copy, Check, Users, Code2, ChevronDown, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { getSessionUrl, SUPPORTED_LANGUAGES } from '@/lib/session';

interface SessionHeaderProps {
  sessionCode: string;
  title: string;
  language: string;
  username: string;
  participantCount: number;
  onTitleChange: (title: string) => void;
  onLanguageChange: (language: string) => void;
  onToggleUsers: () => void;
}

const SessionHeader = ({
  sessionCode,
  title,
  language,
  username,
  participantCount,
  onTitleChange,
  onLanguageChange,
  onToggleUsers,
}: SessionHeaderProps) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const { toast } = useToast();
  const navigate = useNavigate();

  const sessionUrl = getSessionUrl(sessionCode);
  const currentLanguage = SUPPORTED_LANGUAGES.find((l) => l.id === language);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(sessionUrl);
      setCopied(true);
      toast({
        title: 'Link copied!',
        description: 'Share this link with your candidate',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the link manually',
        variant: 'destructive',
      });
    }
  };

  const handleTitleSubmit = () => {
    if (editTitle.trim()) {
      onTitleChange(editTitle.trim());
    } else {
      setEditTitle(title);
    }
    setIsEditing(false);
  };

  return (
    <header className="glass-panel border-b border-border/50 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and Title */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Code2 className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold">CodeSync</span>
          </div>

          <div className="h-6 w-px bg-border" />

          {/* Session Title */}
          {isEditing ? (
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
              className="h-8 w-64 bg-secondary/50"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-lg font-medium text-foreground/90 hover:text-foreground transition-colors"
            >
              {title}
            </button>
          )}

          {/* Session Code Badge */}
          <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1">
            <span className="text-xs text-muted-foreground">Session:</span>
            <span data-testid="session-code" className="font-mono font-medium text-primary">{sessionCode}</span>
          </div>

          {/* Username Badge */}
          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 border border-primary/20">
            <span className="text-[10px] uppercase font-bold text-primary/70">User</span>
            <span className="font-medium text-xs text-primary">{username}</span>
          </div>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center gap-4">
          {/* Participants - Clickable to toggle panel */}
          <button
            onClick={onToggleUsers}
            className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 hover:bg-secondary/80 transition-colors"
          >
            <div className="relative">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-success text-[8px] font-bold text-background">
                {participantCount}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {participantCount} online
            </span>
          </button>

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button data-testid="language-selector" variant="secondary" size="sm" className="gap-2">
                {currentLanguage?.name || 'Select Language'}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.id}
                  onClick={() => onLanguageChange(lang.id)}
                  className={language === lang.id ? 'bg-primary/10 text-primary' : ''}
                >
                  {lang.name}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {lang.extension}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Share Button */}
          <Button onClick={copyLink} className="gap-2">
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Link className="h-4 w-4" />
                Share Link
              </>
            )}
          </Button>

          {/* Exit Button */}
          <Button
            variant="destructive"
            size="icon"
            onClick={() => navigate('/')}
            title="Exit Session"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default SessionHeader;
