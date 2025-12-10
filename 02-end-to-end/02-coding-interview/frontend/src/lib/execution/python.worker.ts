import { ExecutionMessage, WorkerMessage } from './worker.types';

// Declare self for the worker context
declare const self: Worker;
declare function importScripts(...urls: string[]): void;

const ctx: Worker = self as any;

let pyodide: any = null;

const sendMessage = (message: ExecutionMessage) => {
    ctx.postMessage(message);
};

const loadPyodide = async () => {
    try {
        sendMessage({ type: 'log', content: 'Loading Python environment...' });

        // Import the classic script for Pyodide
        importScripts('https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js');

        // @ts-ignore - loadPyodide is defined by the script above
        pyodide = await self.loadPyodide();

        // Redirect stdout/stderr
        pyodide.setStdout({
            batched: (msg: string) => sendMessage({ type: 'log', content: msg })
        });
        pyodide.setStderr({
            batched: (msg: string) => sendMessage({ type: 'error', content: msg })
        });

        sendMessage({ type: 'log', content: 'Python environment ready.' });
    } catch (err: any) {
        sendMessage({ type: 'error', content: `Failed to load Pyodide: ${err.message}` });
    }
};

ctx.addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
    const { type, code } = event.data;

    if (type === 'execute') {
        if (!pyodide) {
            await loadPyodide();
        }

        if (!pyodide) return;

        try {
            await pyodide.runPythonAsync(code);
            sendMessage({ type: 'result', content: 'Execution finished' });
        } catch (error: any) {
            sendMessage({
                type: 'error',
                content: error.message || String(error)
            });
        }
    }
});
