# AI Live Chat – Spur Founding Full‑Stack Engineer Take‑Home

This repository contains a mini AI‑powered customer support chat application built as part of the Spur Founding Full‑Stack Engineer take‑home assignment.

The goal of the project is to simulate a realistic live‑chat support system where users can interact with an AI agent, maintain conversational context, and manage multiple chat threads — similar to what you would find in a real customer engagement platform.

---

## What This Project Does

- Provides a web‑based live chat interface
- Uses an LLM to generate contextual support responses
- Persists conversations and messages in a database
- Supports multiple chat threads with isolated context
- Allows users to start new chats and revisit old ones
- Handles errors gracefully and avoids crashes on bad input

The focus of this project is correctness, clean architecture, and realistic product behavior rather than visual polish.

---

## Tech Stack

### Backend
- Node.js
- TypeScript
- Express
- PostgreSQL
- Prisma ORM
- OpenAI API (with a mock mode for local development)

### Frontend
- SvelteKit
- TypeScript
- Fetch API
- Plain CSS (no design system)

---

## Project Structure

```
ai-live-chat/
├── backend/
│   ├── src/
│   │   ├── controllers/    # HTTP request/response handlers
│   │   ├── services/       # Business logic (chat flow, LLM calls)
│   │   ├── repositories/   # Database access via Prisma
│   │   ├── routes/         # Express route definitions
│   │   └── db/             # Prisma client setup
│   └── prisma/
│       ├── schema.prisma   # Database schema
│       └── migrations/     # Prisma migrations
│
├── frontend/
│   └── src/
│       └── routes/
│           └── +page.svelte
│
└── README.md
```

---

## Running the Project Locally

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL running locally
- npm

---

### Step 1: Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
DATABASE_URL=postgresql://<username>:<password>@localhost:5432/ai_live_chat
OPENAI_API_KEY=your_openai_api_key
USE_MOCK_LLM=true
```

Notes:
- `USE_MOCK_LLM=true` allows you to test the entire app without consuming OpenAI credits.
- Set it to `false` once you add billing and want real responses.

---

### Step 2: Database Setup

Create a PostgreSQL database named:

```text
ai_live_chat
```

Run migrations:

```bash
npx prisma migrate dev
```

This will:
- Create the required tables
- Apply schema changes
- Generate the Prisma client

You can inspect the database using:

```bash
npx prisma studio
```

---

### Step 3: Start Backend Server

```bash
npm run dev
```

Backend will run at:

```text
http://localhost:3000
```

---

### Step 4: Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file inside the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
```

Frontend will run at:

```text
http://localhost:5173
```

---

## Architecture Overview

### Backend Architecture

The backend is structured using a layered approach:

- **Routes**  
  Define API endpoints and map them to controllers.

- **Controllers**  
  Handle request validation and HTTP responses.

- **Services**  
  Contain business logic such as:
  - Creating conversations
  - Persisting messages
  - Generating AI replies
  - Managing conversation state

- **Repositories**  
  Abstract all database operations using Prisma.

This separation keeps the codebase readable, testable, and easy to extend.

---

### Frontend Architecture

The frontend is intentionally simple:

- A single SvelteKit page handles the chat UI
- State is managed locally for:
  - Conversations list
  - Active chat
  - Messages
- The active conversation is persisted using localStorage to survive page refreshes

The UI prioritizes clarity and realistic chat behavior over styling.

---

## LLM Integration Notes

- **Provider Used:** OpenAI
- **Model:** Lightweight chat‑optimized model (configurable)
- **Prompting Strategy:**
  - A system prompt defines the AI as a helpful e‑commerce support agent
  - Store policies (shipping, returns, refunds, support hours) are embedded in the prompt
  - Conversation history for the active chat is passed on every request

Each chat thread is fully isolated. The LLM only sees messages from the currently active conversation.

---

## Design Decisions

- Conversations are session‑based and stateful
- Each chat maintains its own context
- Multiple chats can exist simultaneously
- Refreshing the page restores the active chat
- Opening the app fresh starts a new chat
- LLM logic is fully encapsulated behind a service layer

These decisions mirror how real customer support chat systems behave.

---

## Trade‑offs and Future Improvements

Given more time, the following improvements would be considered:

- User authentication and accounts
- Manual renaming and deletion of chat threads
- Streaming AI responses (token‑by‑token)
- Rate limiting and caching (Redis)
- Better cost controls for LLM usage
- Support for additional channels like WhatsApp or Instagram

---

## Final Notes

This project was built with the intent to resemble a real, production‑oriented feature rather than a demo. The focus was on architecture, data modeling, and realistic user experience.

The system is designed to be easily extended and adapted for additional channels and features in the future.
