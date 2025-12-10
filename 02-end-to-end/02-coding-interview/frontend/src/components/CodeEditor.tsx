import { useCallback, useRef } from 'react';
import Editor, { OnMount, OnChange } from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';

interface CodeEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

const CodeEditor = ({ value, language, onChange, readOnly = false }: CodeEditorProps) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;

    // Configure the editor theme
    monaco.editor.defineTheme('interview-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6B7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'FF7B72', fontStyle: 'bold' },
        { token: 'keyword.control', foreground: 'FF7B72', fontStyle: 'bold' },
        { token: 'operator', foreground: '79C0FF' },
        { token: 'string', foreground: 'A5D6FF' },
        { token: 'string.escape', foreground: '79C0FF' },
        { token: 'regexp', foreground: 'A5D6FF' },
        { token: 'number', foreground: '79C0FF' },
        { token: 'type', foreground: 'FFA657' },
        { token: 'class', foreground: 'FFA657' },
        { token: 'function', foreground: 'D2A8FF', fontStyle: 'bold' },
        { token: 'method', foreground: 'D2A8FF', fontStyle: 'bold' },
        { token: 'variable', foreground: 'C9D1D9' },
        { token: 'variable.parameter', foreground: 'FFA657' },
        { token: 'property', foreground: 'C9D1D9' },
        { token: 'interface', foreground: 'FFA657' },
        { token: 'namespace', foreground: 'FFA657' },
        { token: 'delimiter', foreground: 'C9D1D9' },
      ],
      colors: {
        'editor.background': '#0D1117',
        'editor.foreground': '#C9D1D9',
        'editor.lineHighlightBackground': '#161B22',
        'editor.selectionBackground': '#264F78',
        'editorCursor.foreground': '#58A6FF',
        'editorLineNumber.foreground': '#484F58',
        'editorLineNumber.activeForeground': '#C9D1D9',
        'editor.inactiveSelectionBackground': '#264F7850',
        'editorGutter.background': '#0D1117',
        'editorWidget.background': '#161B22',
        'editorWidget.border': '#30363D',
        'input.background': '#0D1117',
        'input.border': '#30363D',
        'input.foreground': '#C9D1D9',
        'scrollbar.shadow': '#00000000',
        'scrollbarSlider.activeBackground': '#484F58',
        'scrollbarSlider.background': '#30363D80',
        'scrollbarSlider.hoverBackground': '#484F58',
      },
    });

    monaco.editor.setTheme('interview-dark');

    // Focus the editor
    editor.focus();
  }, []);

  const handleChange: OnChange = useCallback(
    (newValue) => {
      if (newValue !== undefined) {
        onChange(newValue);
      }
    },
    [onChange]
  );

  // Map language IDs to Monaco language identifiers
  const getMonacoLanguage = (lang: string): string => {
    const languageMap: Record<string, string> = {
      javascript: 'javascript',
      typescript: 'typescript',
      python: 'python',
      java: 'java',
      cpp: 'cpp',
      csharp: 'csharp',
      go: 'go',
      rust: 'rust',
      ruby: 'ruby',
      php: 'php',
      swift: 'swift',
      kotlin: 'kotlin',
    };
    return languageMap[lang] || 'plaintext';
  };

  return (
    <div data-testid="code-editor" className="h-full w-full overflow-hidden rounded-lg border border-border bg-[#0D1117]">
      <Editor
        height="100%"
        language={getMonacoLanguage(language)}
        value={value}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        loading={
          <div className="flex h-full items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', monospace",
          lineNumbers: 'on',
          roundedSelection: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          padding: { top: 16, bottom: 16 },
          renderLineHighlight: 'line',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          scrollbar: {
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
        }}
      />
    </div>
  );
};

export default CodeEditor;
