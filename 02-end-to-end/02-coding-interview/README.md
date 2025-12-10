# Interview Platform

A real-time collaborative technical interview platform with live code editing, multi-language support, and secure in-browser code execution.

## 🚀 Features

- **Real-time Collaborative Editing** - Multiple participants can edit code simultaneously with instant synchronization
- **Unique Session Links** - Generate shareable 6-character session codes for easy access
- **Multi-language Support** - Syntax highlighting for JavaScript, TypeScript, Python, Java, C++, Go, Rust, and more
- **Secure Code Execution** - Run JavaScript/TypeScript code safely in sandboxed iframes
- **Monaco Editor** - VSCode-like editing experience with autocomplete and syntax highlighting
- **Dark Theme** - Developer-focused dark interface with electric blue accents

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Monaco Editor** - Code editor component
- **Socket.io Client** - Real-time WebSocket communication
- **Shadcn/ui** - UI component library

### Backend
- **Express.js** - HTTP server
- **Socket.io** - WebSocket server for real-time sync
- **TypeScript** - Type safety
- **Supabase** - PostgreSQL database and authentication
- **Node.js** - Runtime environment

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Web server and reverse proxy (Frontend container)

### Testing
- **Vitest** - Unit and integration tests
- **Supertest** - API testing
- **Playwright** - End-to-end browser tests
- **Socket.io Client** - WebSocket testing

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm 9+

### Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd interview-platform

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..


# Install Playwright browsers (for E2E tests)
cd frontend
npx playwright install
cd ..
```

## 🗄️ Database Setup (Supabase)

1. **Create a Supabase Project**: Go to [database.new](https://database.new) and create a new project.
2. **Get Credentials**:
   - Go to Project Settings -> API.
   - Copy `Project URL` (`SUPABASE_URL`).
   - Copy `service_role` secret (`SUPABASE_SERVICE_KEY`) for backend.
   - Copy `anon` public key (`VITE_SUPABASE_PUBLISHABLE_KEY`) for frontend.
3. **Run Migrations**:
   - Copy the SQL from `backend/supabase/migrations/20251210040000_add_users_and_candidates.sql`.
   - Run it in the Supabase SQL Editor to create `users`, `candidates`, and `interview_sessions` tables.

## 🔧 Environment Configuration

### Frontend (.env)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SERVER_URL=http://localhost:3001
```

### Backend (server/.env)
```env
PORT=3001
CLIENT_URL=http://localhost:5173
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key
```

## 🖥 Running the Application

### Docker Mode (Recommended for Production/Easy Start)

1. Create a root `.env` file with backend variables:
   ```env
   SUPABASE_URL=...
   SUPABASE_SERVICE_KEY=...
   ```
2. Build and run:
   ```bash
   docker-compose up --build
   ```
   - Frontend: http://localhost:8080
   - Backend: http://localhost:3001

### Development Mode
81: 
82: **Option 1: Run Everything (Recommended)**
83: ```bash
84: # Install all dependencies (frontend, backend, root)
85: npm run install:all
86: 
87: # Run both servers
88: npm run dev
89: ```
90: 
91: **Option 2: Run Separately**
92: 
93: **Terminal 1 - Start the Backend:**

**Terminal 1 - Start the Backend:**
```bash
cd backend
npm run dev
```
The server will run on http://localhost:3001

**Terminal 2 - Start the Frontend:**
```bash
# Start frontend
cd frontend
npm run dev
```
The frontend will run on http://localhost:5173

### Production Mode

```bash
# Build frontend
# Build frontend
cd frontend
npm run build
cd ..

# Build backend
cd backend
npm run build

# Start backend
npm start

# Serve frontend with any static server
npx serve dist
```

## 🧪 Testing

### Run All Tests (Single Command)
```bash
npm run test:all
```

### Backend Tests

```bash
cd backend

# Run all backend tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

**Test Categories:**
- `api.test.ts` - REST API endpoint tests
- `socket.test.ts` - WebSocket integration tests  
- `sessionStore.test.ts` - Unit tests for session management

### Running Tests

You can run all tests (frontend and backend) from the root directory:

```bash
npm test
```

### Frontend Tests

```bash
# Run frontend unit tests
cd frontend
npm run test

# Run with coverage
npm run test:coverage
```

### End-to-End Tests

```bash
# Run E2E tests (starts servers automatically)
# Run E2E tests (starts servers automatically)
cd frontend
npm run test:e2e

# Run E2E tests with UI
# Run E2E tests with UI
npm run test:e2e:ui

# Run specific test file
npx playwright test e2e/interview-platform.spec.ts
```

**E2E Test Coverage:**
- Session creation from home page
- Joining sessions via URL
- Code editor functionality
- Language selection
- Real-time collaboration between browsers
- Code execution
- Session header and sharing

## 📡 API Reference

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/sessions` | Create new session |
| GET | `/api/sessions` | List all sessions |
| GET | `/api/sessions/:code` | Get session by code |
| PATCH | `/api/sessions/:code/content` | Update session content |
| PATCH | `/api/sessions/:code/language` | Update session language |
| DELETE | `/api/sessions/:code` | Delete session |

### WebSocket Events

**Client → Server:**
| Event | Payload | Description |
|-------|---------|-------------|
| `session:join` | `{ sessionCode }` | Join a session |
| `content:update` | `{ sessionCode, content }` | Send code update |
| `language:update` | `{ sessionCode, language }` | Change language |
| `title:update` | `{ sessionCode, title }` | Update session title |

**Server → Client:**
| Event | Payload | Description |
|-------|---------|-------------|
| `session:joined` | Session data | Confirmation of join |
| `session:error` | `{ message }` | Error message |
| `content:updated` | `{ content, senderId }` | Code update from another user |
| `language:updated` | `{ language }` | Language change notification |
| `title:updated` | `{ title }` | Title change notification |
| `participant:joined` | `{ participantCount }` | New participant notification |
| `participant:left` | `{ participantCount }` | Participant left notification |

## 🔒 Security

### Secure Code Execution
Code execution happens entirely in the browser using sandboxed iframes:
- Isolated execution environment
- No server-side code execution
- Limited JavaScript/TypeScript support
- Console output capture
- Error handling and timeout protection

### WebSocket Security
- CORS configuration for allowed origins
- Session validation before joining
- Rate limiting recommended for production

## 🏗 Project Structure

```
interview-platform/
├── frontend/              # Frontend (React + Vite)
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   ├── e2e/               # Playwright E2E tests
│   ├── Dockerfile
│   └── nginx.conf
├── backend/               # Backend (Express + Socket.io)
│   ├── src/
│   ├── supabase/          # Migrations and config
│   ├── tests/             # Backend tests
│   └── Dockerfile
├── docker-compose.yml
├── README.md
└── AGENTS.md
```

## 🐛 Troubleshooting

### Common Issues

**WebSocket Connection Failed**
- Ensure the backend server is running on port 3001
- Check CORS configuration matches your frontend URL
- Verify no firewall blocking WebSocket connections

**Monaco Editor Not Loading**
- Clear browser cache
- Check for JavaScript errors in console
- Ensure @monaco-editor/react is installed

**Tests Failing**
```bash
# Reset test environment
cd server && npm install
npm install
npx playwright install --with-deps
```

**Port Already in Use**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Debug Mode

```bash
# Run frontend with verbose logging
DEBUG=* npm run dev

# Run backend with verbose logging
cd server && DEBUG=* npm run dev
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Run tests: `npm run test:all`
4. Commit changes: `git commit -am 'Add feature'`
5. Push to branch: `git push origin feature/my-feature`
6. Submit a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.
