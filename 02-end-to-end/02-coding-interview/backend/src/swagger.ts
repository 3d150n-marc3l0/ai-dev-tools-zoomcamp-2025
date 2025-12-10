import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Code Connect Live API',
            version: '1.0.0',
            description: 'REST API for technical interview platform with real-time collaborative coding sessions',
            contact: {
                name: 'API Support',
            },
        },
        servers: [
            {
                url: process.env.NODE_ENV === 'production'
                    ? (process.env.RENDER_EXTERNAL_URL || 'https://your-app.onrender.com')
                    : `http://localhost:${process.env.PORT || 3001}`,
                description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
            },
        ],
        components: {
            schemas: {
                Session: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Unique session identifier',
                            example: 'session_1234567890',
                        },
                        code: {
                            type: 'string',
                            description: '6-character session code for joining',
                            example: 'ABC123',
                            pattern: '^[A-Z0-9]{6}$',
                        },
                        title: {
                            type: 'string',
                            description: 'Session title',
                            example: 'JavaScript Interview',
                        },
                        language: {
                            type: 'string',
                            description: 'Programming language for the session',
                            example: 'javascript',
                            enum: ['javascript', 'python', 'typescript', 'java', 'cpp', 'go', 'rust'],
                        },
                        content: {
                            type: 'string',
                            description: 'Current code content',
                            example: '// Write your code here',
                        },
                        participantCount: {
                            type: 'number',
                            description: 'Number of participants in the session',
                            example: 2,
                        },
                        participants: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/Participant',
                            },
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Session creation timestamp',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last update timestamp',
                        },
                    },
                },
                Participant: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Participant socket ID',
                            example: 'socket_abc123',
                        },
                        name: {
                            type: 'string',
                            description: 'Participant name',
                            example: 'John Doe',
                        },
                    },
                },
                CreateSessionRequest: {
                    type: 'object',
                    properties: {
                        language: {
                            type: 'string',
                            description: 'Programming language',
                            example: 'javascript',
                            default: 'javascript',
                        },
                        title: {
                            type: 'string',
                            description: 'Session title',
                            example: 'Technical Interview',
                            default: 'Untitled Session',
                        },
                        username: {
                            type: 'string',
                            description: 'Interviewer username (optional)',
                            example: 'interviewer@example.com',
                        },
                        email: {
                            type: 'string',
                            description: 'Interviewer email (optional)',
                            example: 'interviewer@example.com',
                        },
                    },
                },
                JoinSessionRequest: {
                    type: 'object',
                    required: ['name', 'email'],
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Candidate name',
                            example: 'Jane Smith',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Candidate email',
                            example: 'candidate@example.com',
                        },
                    },
                },
                UpdateContentRequest: {
                    type: 'object',
                    required: ['content'],
                    properties: {
                        content: {
                            type: 'string',
                            description: 'New code content',
                            example: 'function hello() { return "world"; }',
                        },
                    },
                },
                UpdateLanguageRequest: {
                    type: 'object',
                    required: ['language'],
                    properties: {
                        language: {
                            type: 'string',
                            description: 'New programming language',
                            example: 'python',
                        },
                    },
                },
                UpdateTitleRequest: {
                    type: 'object',
                    required: ['title'],
                    properties: {
                        title: {
                            type: 'string',
                            description: 'New session title',
                            example: 'Python Interview',
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: 'Error message',
                            example: 'Session not found',
                        },
                    },
                },
                HealthResponse: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'ok',
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
            },
        },
        tags: [
            {
                name: 'Sessions',
                description: 'Session management endpoints',
            },
            {
                name: 'Health',
                description: 'Health check endpoints',
            },
        ],
    },
    apis: ['./src/app.ts'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerSpec, swaggerUi };
