## Initial Prompt

I want to build an online technical interview platform with real-time collaborative code editing.  
Please design the complete architecture, backend API, frontend components, and provide working code examples.

### Project Requirements
- **Frontend:** React + Vite  
- **Backend:** Express.js  
- **Features:**
  - Generate a unique link for each interview session and share it with candidates.
  - Real-time collaborative code editing for all connected users.
  - Instant code updates for everyone in the session.
  - Syntax highlighting for multiple programming languages.
  - Secure client-side code execution (running code directly in the browser, not on the server).
  - Real-time communication using WebSockets or similar technologies.

### What You Need to Deliver
1. **Full system architecture** (frontend, backend, WebSocket layer, modules).  
2. **API and WebSocket design**, including endpoints and event names.  
3. **Project folder structure** for both frontend and backend.  
4. **Working code examples**, including:
   - React collaborative code editor component.
   - WebSocket configuration (client + server).
   - Logic for generating unique session links.
5. **Recommended libraries**, such as:
   - Monaco Editor or CodeMirror 6 for the editor  
   - Y.js, CRDTs, or Socket.io for synchronization  
6. **Technical explanation for secure in-browser code execution**, using WebContainers, sandboxing, or iframes.  
7. **Best practices for security, scalability, and performance.**

### Format
Respond in well-structured sections, with code samples and explanations.





## Task: Create Integration Tests + Update README.md

I need you to add integration tests to verify that the interaction between the client (React + Vite) and the server (Express.js) works correctly.

### Requirements for Integration Tests
The tests should validate:
- That the server starts correctly and exposes the expected API endpoints.
- That the client can successfully connect to the backend.
- That WebSocket communication works end-to-end (client <-> server).
- That collaborative code updates are sent by one client and received by another.
- That session link creation works and returns valid session identifiers.
- Any other relevant interaction between frontend and backend.

### Testing Stack
You may use any of the following (or justify alternatives):
- **Vitest** for frontend tests  
- **Jest** or **Supertest** for backend API tests  
- **Playwright** or **Cypress** for full end-to-end tests  
- **Socket.io testing utilities** (if applicable)

The tests must be runnable with a single command.

### README.md Requirements
Begin creating (or updating) a complete `README.md` file including:
- Project overview
- Tech stack
- Installation instructions
- Commands for:
  - Running the backend
  - Running the frontend
  - Running integration tests
  - Running unit tests (if applicable)
  - Running end-to-end tests
- Instructions for testing real-time features
- Environment variable configuration
- Troubleshooting section

### Format
Respond with:
1. The proposed test architecture  
2. The individual test files you will generate  
3. The commands that will be added to `package.json`  
4. The initial version of the README.md file  
5. All code blocks in proper Markdown format



## Task: Run cliente and Server at the same time + Update README.md

Now let's make it possible to run both client and server at the same time. Use concurrently for that.


## Task: Add Syntax Highlighting for JavaScript and Python
for my code editor component, I need to add syntax highlighting for JavaScript and Python.
Let's now add support for syntax highlighting for JavaScript and Python.


## Task: Add Code Execution
Now let's add code execution.
For security reasons, we don't want to execute code directly on the server. Instead, let's use WASM to execute the code only in the browser.


## Task: Add Containerization
Now let's containerize our application. Help me to create a Dockerfile for the application. Put both backend and frontend in one container.