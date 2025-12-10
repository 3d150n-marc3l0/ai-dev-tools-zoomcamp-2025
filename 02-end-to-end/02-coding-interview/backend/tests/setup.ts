import { vi } from 'vitest';
import crypto from 'crypto';

// Mock environment variables
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_SERVICE_KEY = 'mock-key';

// Mock Supabase client
vi.mock('../src/lib/supabase', () => {
    const mockDb = {
        sessions: [] as any[],
        candidates: [] as any[]
    };

    return {
        supabase: {
            _reset: () => {
                mockDb.sessions = [];
                mockDb.candidates = [];
            },
            from: vi.fn((table) => {
                const chain: any = {
                    data: [] as any[],
                    filters: {} as Record<string, any>,

                    select: vi.fn(() => chain),

                    insert: vi.fn((data: any) => {
                        if (Array.isArray(data)) data = data[0];
                        const newItem = {
                            id: crypto.randomUUID(),
                            code: data.code || '123456',
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            ...data
                        };
                        if (table === 'interview_sessions') mockDb.sessions.push(newItem);

                        chain.data = [newItem];
                        return chain;
                    }),

                    update: vi.fn((data) => {
                        chain.filters.updates = data;
                        return chain;
                    }),

                    delete: vi.fn(() => {
                        chain.filters.isDelete = true;
                        return chain;
                    }),

                    eq: vi.fn((field, value) => {
                        chain.filters[field] = value;
                        return chain;
                    }),

                    single: vi.fn(() => {
                        let result = null;

                        if (chain.data && chain.data.length > 0 && Object.keys(chain.filters).length === 0) {
                            return { data: chain.data[0], error: null };
                        }

                        if (table === 'interview_sessions') {
                            if (chain.filters.isDelete) {
                                const idx = mockDb.sessions.findIndex(s => s.code === chain.filters.code);
                                if (idx !== -1) mockDb.sessions.splice(idx, 1);
                                return { data: null, error: null };
                            }

                            const code = chain.filters.code;
                            if (code) {
                                result = mockDb.sessions.find(s => s.code === code);
                            }

                            if (result && chain.filters.updates) {
                                Object.assign(result, chain.filters.updates, { updated_at: new Date().toISOString() });
                            }
                        }

                        return { data: result || null, error: result ? null : { message: 'Not found', code: '404' } };
                    }),

                    maybeSingle: vi.fn(() => {
                        let result = null;
                        if (table === 'interview_sessions') {
                            const code = chain.filters.code;
                            if (code) {
                                result = mockDb.sessions.find(s => s.code === code);
                            }
                        }
                        return { data: result || null, error: null };
                    }),

                    then: (resolve: Function) => {
                        if (table === 'interview_sessions' && !chain.filters.code && !chain.filters.id && !chain.filters.isDelete) {
                            resolve({ data: mockDb.sessions || [], error: null });
                            return;
                        }

                        if (chain.filters.isDelete && table === 'interview_sessions') {
                            const idx = mockDb.sessions.findIndex(s => s.code === chain.filters.code);
                            if (idx !== -1) mockDb.sessions.splice(idx, 1);
                            resolve({ error: null });
                            return;
                        }

                        resolve({ data: chain.data, error: null });
                    }
                };

                return chain;
            })
        }
    };
});
