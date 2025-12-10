import { ExecutionMessage, WorkerMessage } from './worker.types';

const ctx: Worker = self as any;

const sendMessage = (message: ExecutionMessage) => {
    ctx.postMessage(message);
};

// Override console
const customConsole = {
    log: (...args: any[]) => {
        sendMessage({
            type: 'log',
            content: args.map(arg => String(arg)).join(' ')
        });
    },
    error: (...args: any[]) => {
        sendMessage({
            type: 'error',
            content: args.map(arg => String(arg)).join(' ')
        });
    },
    warn: (...args: any[]) => {
        sendMessage({
            type: 'log', // Treat warn as log for simplicity or add 'warn' type
            content: '[WARN] ' + args.map(arg => String(arg)).join(' ')
        });
    }
};

ctx.addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
    const { type, code } = event.data;

    if (type === 'execute') {
        try {
            // Create a function from the code string to execute it
            // We wrap it in an async function to support await if needed
            const runUserCode = new Function('console', `
        return (async () => {
          try {
            ${code}
          } catch (err) {
            throw err;
          }
        })();
      `);

            await runUserCode(customConsole);

            sendMessage({ type: 'result', content: 'Execution finished' });
        } catch (error: any) {
            sendMessage({
                type: 'error',
                content: error.message || String(error)
            });
        }
    }
});
