const BASE_URL = 'http://localhost:5000';

// ── token helpers ─────────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem('token');
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

// ── auth endpoints (no token needed) ─────────────────────────────────────────
export const registerUser = (email, password) =>
  fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  }).then(res => res.json());

export const loginUser = (email, password) =>
  fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  }).then(res => res.json());

export const getMe = () =>
  fetch(`${BASE_URL}/auth/me`, {
    headers: { ...authHeader() }
  }).then(res => res.json());

// ── task endpoints (Bearer token required) ────────────────────────────────────
export const getTasks = () =>
  fetch(`${BASE_URL}/tasks`, {
    headers: { ...authHeader() }
  }).then(res => res.json());

export const createTask = (taskData) =>
  fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(taskData)
  }).then(res => res.json());

export const updateTask = (id, taskData) =>
  fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(taskData)
  }).then(res => res.json());

export const deleteTask = (id) =>
  fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: { ...authHeader() }
  }).then(res => res.json());
