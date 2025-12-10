import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Users, Zap, Shield, ArrowRight, Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useSession } from '@/hooks/useSession';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { createSession } = useSession();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  // Start Session Form State
  const [startOpen, setStartOpen] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [startUsername, setStartUsername] = useState('');
  const [startEmail, setStartEmail] = useState('');

  // Join Session Form State
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinEmail, setJoinEmail] = useState('');

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTitle.trim() || !startUsername.trim() || !startEmail.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all fields to start a session.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      // Store user info
      localStorage.setItem('code_connect_username', startUsername);
      localStorage.setItem('code_connect_email', startEmail);

      const session = await createSession('javascript', sessionTitle);
      if (session) {
        setStartOpen(false);
        navigate(`/session/${session.code}`);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinSession = (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();

    if (code.length !== 6 || !joinName.trim() || !joinEmail.trim()) {
      toast({
        title: 'Invalid details',
        description: 'Please enter a valid 6-character code, name, and email.',
        variant: 'destructive',
      });
      return;
    }

    // Store user info
    localStorage.setItem('code_connect_username', joinName);
    localStorage.setItem('code_connect_email', joinEmail);

    setJoinOpen(false);
    navigate(`/session/${code}`);
  };

  const features = [
    {
      icon: Users,
      title: 'Real-time Collaboration',
      description: 'Multiple users can edit code simultaneously with instant synchronization',
    },
    {
      icon: Zap,
      title: 'Instant Execution',
      description: 'Run JavaScript code directly in the browser with immediate feedback',
    },
    {
      icon: Shield,
      title: 'Secure Sandbox',
      description: 'Code runs in an isolated environment for safety and security',
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-hero-pattern" />
      <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-primary/20 via-transparent to-transparent blur-3xl" />

      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-6 py-8">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 glow-effect">
                <Code2 className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-bold">CodeSync</span>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-6 py-20">
          <div className="mx-auto max-w-4xl text-center slide-up">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              Real-time Technical Interviews
            </div>

            {/* Main Heading */}
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              Conduct{' '}
              <span className="hero-gradient">Technical Interviews</span>
              {' '}Together
            </h1>

            <p className="mx-auto mb-12 max-w-2xl text-xl text-muted-foreground">
              A collaborative code editor for seamless technical interviews.
              Share a link, code together in real-time, and evaluate candidates effectively.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">

              {/* Start Session Dialog */}
              <Dialog open={startOpen} onOpenChange={setStartOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="hero"
                    size="xl"
                    className="group w-full sm:w-auto"
                  >
                    <Play className="h-5 w-5" />
                    Start New Session
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Start New Session</DialogTitle>
                    <DialogDescription>
                      Enter your details to create a new collaborative coding session.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateSession} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="session-title">Session Title</Label>
                      <Input
                        id="session-title"
                        placeholder="e.g. Frontend Interview - Candidate A"
                        value={sessionTitle}
                        onChange={(e) => setSessionTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start-username">Username</Label>
                        <Input
                          id="start-username"
                          placeholder="John Doe"
                          value={startUsername}
                          onChange={(e) => setStartUsername(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="start-email">Email</Label>
                        <Input
                          id="start-email"
                          type="email"
                          placeholder="john@example.com"
                          value={startEmail}
                          onChange={(e) => setStartEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isCreating} className="w-full">
                        {isCreating ? 'Creating Session...' : 'Create Session'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <span className="text-muted-foreground">or</span>

              {/* Join Session Dialog */}
              <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="h-12 w-full sm:w-auto min-w-[140px]"
                  >
                    Join Session
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Join Session</DialogTitle>
                    <DialogDescription>
                      Enter the session code and your details to join.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleJoinSession} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="join-code">Session Code</Label>
                      <Input
                        id="join-code"
                        placeholder="ABC-123"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        maxLength={6}
                        className="font-mono uppercase"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="join-name">Name</Label>
                        <Input
                          id="join-name"
                          placeholder="Jane Smith"
                          value={joinName}
                          onChange={(e) => setJoinName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="join-email">Email</Label>
                        <Input
                          id="join-email"
                          type="email"
                          placeholder="jane@example.com"
                          value={joinEmail}
                          onChange={(e) => setJoinEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="w-full">
                        Join Session
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

            </div>
          </div>

          {/* Features */}
          <div className="mx-auto mt-32 grid max-w-5xl gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="card-gradient rounded-xl border border-border/50 p-6 fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Code Preview Illustration */}
          <div className="mx-auto mt-24 max-w-4xl fade-in" style={{ animationDelay: '600ms' }}>
            <div className="card-gradient overflow-hidden rounded-2xl border border-border/50 shadow-2xl">
              {/* Editor Header */}
              <div className="flex items-center gap-2 border-b border-border/50 bg-secondary/30 px-4 py-3">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-destructive/50" />
                  <div className="h-3 w-3 rounded-full bg-warning/50" />
                  <div className="h-3 w-3 rounded-full bg-success/50" />
                </div>
                <span className="ml-4 text-sm text-muted-foreground font-mono">solution.js</span>
              </div>
              {/* Code Preview */}
              <div className="p-6 font-mono text-sm">
                <pre className="text-muted-foreground">
                  <span className="text-primary">function</span>{' '}
                  <span className="text-[hsl(262_83%_68%)]">twoSum</span>
                  <span className="text-foreground">(nums, target) {'{'}</span>
                  {'\n'}
                  {'  '}<span className="text-primary">const</span> map = <span className="text-primary">new</span> <span className="text-[hsl(262_83%_68%)]">Map</span>();
                  {'\n'}
                  {'  '}<span className="text-primary">for</span> (<span className="text-primary">let</span> i = <span className="text-warning">0</span>; i {'<'} nums.length; i++) {'{'}
                  {'\n'}
                  {'    '}<span className="text-primary">const</span> complement = target - nums[i];
                  {'\n'}
                  {'    '}<span className="text-primary">if</span> (map.<span className="text-[hsl(262_83%_68%)]">has</span>(complement)) {'{'}
                  {'\n'}
                  {'      '}<span className="text-primary">return</span> [map.<span className="text-[hsl(262_83%_68%)]">get</span>(complement), i];
                  {'\n'}
                  {'    '}{'}'}
                  {'\n'}
                  {'    '}map.<span className="text-[hsl(262_83%_68%)]">set</span>(nums[i], i);
                  {'\n'}
                  {'  '}{'}'}
                  {'\n'}
                  {'}'}
                </pre>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-12 text-center text-muted-foreground">
          <p>Built for seamless technical interviews</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
