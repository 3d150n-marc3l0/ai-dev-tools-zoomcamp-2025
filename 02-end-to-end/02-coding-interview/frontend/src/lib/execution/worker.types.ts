export type ExecutionEventType = 'log' | 'error' | 'result';

export interface ExecutionMessage {
    type: ExecutionEventType;
    content: string;
}

export interface WorkerMessage {
    type: 'execute';
    code: string;
}
