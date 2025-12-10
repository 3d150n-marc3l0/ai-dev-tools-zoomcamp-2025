import { useState, useCallback, useEffect, useRef } from 'react';
import { Play, Trash2, Terminal, AlertCircle, CheckCircle2, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ExecutionService } from '@/lib/execution/executionService';

interface OutputLine {
  type: 'log' | 'error' | 'warn' | 'info' | 'result';
  content: string;
  timestamp: Date;
}

interface CodeOutputProps {
  code: string;
  language: string;
}

const CodeOutput = ({ code, language }: CodeOutputProps) => {
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  const executionServiceRef = useRef<ExecutionService | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup worker on unmount
      if (executionServiceRef.current) {
        executionServiceRef.current.terminate();
      }
    };
  }, []);

  const runCode = useCallback(() => {
    setOutput([]);
    setIsRunning(true);
    setExecutionTime(null);

    // Initialize service if needed
    executionServiceRef.current = new ExecutionService(
      (log) => {
        setOutput((prev) => [...prev, log as OutputLine]);
      },
      (result) => {
        setIsRunning(false);
        setExecutionTime(result.duration);
      }
    );

    executionServiceRef.current.run(language, code);
  }, [code, language]);

  const stopExecution = useCallback(() => {
    if (executionServiceRef.current) {
      executionServiceRef.current.terminate();
      setIsRunning(false);
      setOutput((prev) => [
        ...prev,
        { type: 'info', content: 'Execution stopped by user.', timestamp: new Date() },
      ]);
    }
  }, []);

  const clearOutput = useCallback(() => {
    setOutput([]);
    setExecutionTime(null);
  }, []);

  const getIconForType = (type: OutputLine['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warn':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      default:
        return null;
    }
  };

  return (
    <div data-testid="code-output" className="flex h-full flex-col rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Output</span>
          {executionTime !== null && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3 text-success" />
              {executionTime.toFixed(2)}ms
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearOutput}
            disabled={output.length === 0}
            className="h-8 px-2"
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          {isRunning ? (
            <Button
              onClick={stopExecution}
              size="sm"
              variant="destructive"
              className="h-8 gap-2"
            >
              <Square className="h-4 w-4 fill-current" />
              Stop
            </Button>
          ) : (
            <Button
              data-testid="run-button"
              onClick={runCode}
              disabled={isRunning}
              size="sm"
              className="h-8 gap-2"
            >
              <Play className="h-4 w-4" />
              Run
            </Button>
          )}
        </div>
      </div>

      {/* Output Area */}
      <ScrollArea className="flex-1 p-4">
        {output.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p className="text-sm">Run your code to see the output here</p>
          </div>
        ) : (
          <div className="space-y-2 font-mono text-sm">
            {output.map((line, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-2 rounded-md px-3 py-2',
                  line.type === 'error' && 'bg-destructive/10 text-destructive',
                  line.type === 'warn' && 'bg-warning/10 text-warning',
                  line.type === 'log' && 'bg-muted/50 text-foreground',
                  line.type === 'info' && 'bg-primary/10 text-primary'
                )}
              >
                {getIconForType(line.type)}
                <pre className="whitespace-pre-wrap break-all">{line.content}</pre>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default CodeOutput;
