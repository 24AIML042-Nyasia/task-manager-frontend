# Task Manager Frontend

React + Vite frontend for the full-stack Task Manager app.
Connects to the Express + MongoDB backend at `http://localhost:5000`.

## Requirements

- [Node.js](https://nodejs.org/) v18 or later
- The backend must be running before starting the frontend

## Setup and Run

```bash
npm install
npm run dev
```

App will be available at `http://localhost:5173`.

## Usage

1. Open the app in your browser
2. Register a new account with email and password
3. Log in to access your tasks
4. Create, complete, and delete tasks from the main screen
5. Click logout to end your session — the token is cleared from the browser
6. If your session expires (1 hour), you will be redirected to login automatically

## Features

- Register and login with email and password
- JWT token stored in localStorage, persists across page refreshes
- Email shown in header on reload without re-logging in
- Create tasks, mark complete/incomplete with checkbox, delete with confirmation
- Incomplete and completed tasks shown in separate sections
- Token expiry handled: 401 response redirects to login
- Logout clears token and resets state

## Project Structure

```
src/
  App.jsx                  main component, CRUD logic, auth state, UI
  components/
    api.js                 fetch wrappers for all backend endpoints
    AuthForm.jsx           login and register form
  index.css                base reset and background colour
main.jsx                   app entry point
```

## Backend Repo

https://github.com/24AIML042-Nyasia/task-manager-api-24AIML042
