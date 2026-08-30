# CollabAI - System Architecture

## 1. Project Overview

CollabAI is a collaborative AI workspace where multiple users can work together inside groups and communicate with a shared AI.

The platform provides three chat spaces:

1. Personal AI Chat
2. Group Member Chat
3. Group AI Chat

The main purpose is to allow humans and AI to work together inside a shared group environment.

---

## 2. Technology Stack

### Frontend
- React.js

### Backend
- Node.js
- Express.js

### Database
- Supabase PostgreSQL

### Realtime
- Supabase Realtime

### AI
- AI provider accessed through the Node.js backend

---

## 3. High-Level Architecture

```text
React Frontend
      |
      | HTTP / API
      v
Node.js + Express Backend
      |
      +--------------------+
      |                    |
      v                    v
   Supabase             AI Provider
      |
      +----------------+
      |                |
 PostgreSQL         Realtime