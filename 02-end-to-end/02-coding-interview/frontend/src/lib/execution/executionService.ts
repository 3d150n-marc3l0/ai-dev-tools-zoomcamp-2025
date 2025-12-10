import { ExecutionEventType, ExecutionMessage } from './worker.types';
import JSWorker from './javascript.worker?worker';
import PythonWorker from './python.worker?worker';

export interface ExecutionResult {
    logs: { type: ExecutionEventType; content: string; timestamp: Date }[];
    duration: number;
}

export class ExecutionService {
    private worker: Worker | null = null;
    private logs: { type: ExecutionEventType; content: string; timestamp: Date }[] = [];
    private onLog: (log: { type: ExecutionEventType; content: string; timestamp: Date }) => void;
    private onFinish: (result: ExecutionResult) => void;

    constructor(
        onLog: (log: { type: ExecutionEventType; content: string; timestamp: Date }) => void,
        onFinish: (result: ExecutionResult) => void
    ) {
        this.onLog = onLog;
        this.onFinish = onFinish;
    }

    public run(language: string, code: string) {
        this.terminate();
        this.logs = [];

        const startTime = performance.now();

        try {
            if (language === 'javascript' || language === 'typescript') {
                this.worker = new JSWorker();
            } else if (language === 'python') {
                this.worker = new PythonWorker();
            } else {
                this.onLog({
                    type: 'error',
                    content: `Execution for ${language} is not supported in the browser.`,
                    timestamp: new Date()
                });
                this.onFinish({ logs: this.logs, duration: 0 });
                return;
            }

            this.worker.onmessage = (event: MessageEvent<ExecutionMessage>) => {
                const { type, content } = event.data;

                if (type === 'result') {
                    const endTime = performance.now();
                    this.onFinish({
                        logs: this.logs,
                        duration: endTime - startTime
                    });
                    // Optional: terminate on success, or keep alive for stateful REPL
                    this.terminate();
                } else {
                    const logEntry = { type, content, timestamp: new Date() };
                    this.logs.push(logEntry);
                    this.onLog(logEntry);
                }
            };

            this.worker.onerror = (error) => {
                const logEntry = {
                    type: 'error' as ExecutionEventType,
                    content: error.message,
                    timestamp: new Date()
                };
                this.logs.push(logEntry);
                this.onLog(logEntry);

                const endTime = performance.now();
                this.onFinish({ logs: this.logs, duration: endTime - startTime });
                this.terminate();
            };

            this.worker.postMessage({ type: 'execute', code });

        } catch (err: any) {
            this.onLog({
                type: 'error',
                content: `Failed to start execution: ${err.message}`,
                timestamp: new Date()
            });
        }
    }

    public terminate() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }
}
