import React, { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from './components/api';
import AuthForm from './components/AuthForm';

// ── brown palette ─────────────────────────────────────────────────────────────
const C = {
  pageBg:      '#2c1a0e',
  text:        '#f5e6d3',
  textMuted:   '#a07850',
  inputBg:     '#2c1a0e',
  inputBorder: '#6b3d1e',
  accent:      '#c8813a',
  errorBg:     '#5c1a1a',
  errorText:   '#ffaaaa',
};

// ── per-status visual theme ───────────────────────────────────────────────────
const STATUS_THEME = {
  pending: {
    rowBg:        '#3d200a',
    rowBorder:    '#7a3a10',
    borderLeft:   '#e07b30',
    badgeBg:      '#5c2a0a',
    badgeText:    '#f0a060',
    headingColor: '#e07b30',
    headingBorder:'#7a3a10',
  },
  ongoing: {
    rowBg:        '#2e2a0a',
    rowBorder:    '#6b5a10',
    borderLeft:   '#d4b040',
    badgeBg:      '#4a3e08',
    badgeText:    '#f0d060',
    headingColor: '#d4b040',
    headingBorder:'#6b5a10',
  },
  completed: {
    rowBg:        '#0f2a1a',
    rowBorder:    '#1e5c30',
    borderLeft:   '#4a9e60',
    badgeBg:      '#0a2010',
    badgeText:    '#70c080',
    headingColor: '#4a9e60',
    headingBorder:'#1e5c30',
  },
};

// status cycle: clicking the badge rotates through the three states
const NEXT_STATUS = {
  pending:   'ongoing',
  ongoing:   'completed',
  completed: 'pending',
};

const STATUS_LABEL = {
  pending:   'Pending',
  ongoing:   'Ongoing',
  completed: 'Completed',
};

export default function App() {
  // ── auth state ──────────────────────────────────────────────────────────────
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState(() => {
    const t = localStorage.getItem('token');
    if (!t) return null;
    try {
      const payload = JSON.parse(atob(t.split('.')[1]));
      return { email: payload.email, id: payload.id };
    } catch {
      return null;
    }
  });

  // ── task state ──────────────────────────────────────────────────────────────
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAuth = (newToken, user) => {
    setToken(newToken);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    setTasks([]);
    setError(null);
  };

  const handle401 = (json) => {
    if (json && json.success === false &&
        (json.error || '').toLowerCase().includes('token')) {
      handleLogout();
      return true;
    }
    return false;
  };

  // ------------------------------------------------------
  // 1. READ
  // ------------------------------------------------------
  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const json = await getTasks();
      if (handle401(json)) return;
      if (json.success) {
        setTasks(json.data);
      } else {
        setError(json.error || json.message || 'Failed to load tasks');
      }
    } catch (err) {
      setError('Network error. Is the backend running on port 5000?');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchTasks();
  }, [token]);

  // ------------------------------------------------------
  // 2. CREATE (defaults to pending)
  // ------------------------------------------------------
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setError(null);
    try {
      const json = await createTask({
        id: Date.now(),
        title: newTaskTitle.trim(),
        status: 'pending',
      });
      if (handle401(json)) return;
      if (json.success) {
        setTasks([json.data, ...tasks]);
        setNewTaskTitle('');
        setError(null);
      } else {
        setError(json.error || json.message || 'Failed to create task.');
      }
    } catch (err) {
      setError('Network error while creating task.');
    }
  };

  // ------------------------------------------------------
  // 3. CYCLE STATUS: pending -> ongoing -> completed -> pending
  // ------------------------------------------------------
  const handleCycleStatus = async (task) => {
    const nextStatus = NEXT_STATUS[task.status] || 'pending';
    setError(null);
    try {
      const json = await updateTask(task._id, {
        title: task.title,
        status: nextStatus,
        completed: nextStatus === 'completed',
      });
      if (handle401(json)) return;
      if (json.success) {
        setTasks(tasks.map((t) => (t._id === task._id ? json.data : t)));
      } else {
        setError(json.error || json.message || 'Failed to update task.');
      }
    } catch (err) {
      setError('Network error while updating task.');
    }
  };

  // ------------------------------------------------------
  // 4. DELETE
  // ------------------------------------------------------
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const json = await deleteTask(id);
      if (handle401(json)) return;
      if (json.success) {
        setTasks(tasks.filter((t) => t._id !== id));
      } else {
        setError(json.error || json.message || 'Failed to delete task.');
      }
    } catch (err) {
      setError('Network error while deleting task.');
    }
  };

  if (!token) return <AuthForm onAuth={handleAuth} />;

  const pending   = tasks.filter((t) => (t.status || 'pending') === 'pending');
  const ongoing   = tasks.filter((t) => (t.status || 'pending') === 'ongoing');
  const completed = tasks.filter((t) => (t.status || 'pending') === 'completed');

  return (
    <div style={{ minHeight: '100vh', background: C.pageBg, padding: '40px 16px 80px' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', fontFamily: 'Georgia, serif' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <h1 style={{ color: C.text, fontSize: '26px', fontWeight: '700' }}>
            Task Manager
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {currentUser && (
              <span style={{ color: C.textMuted, fontSize: '13px', fontFamily: 'sans-serif' }}>
                {currentUser.email}
              </span>
            )}
            <button onClick={handleLogout} style={{
              padding: '7px 14px', background: 'transparent', color: C.textMuted,
              border: `1px solid ${C.rowBorder}`, borderRadius: '6px',
              cursor: 'pointer', fontSize: '13px', fontFamily: 'sans-serif',
            }}>
              Logout
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            background: C.errorBg, color: C.errorText, padding: '10px 14px',
            borderRadius: '6px', marginBottom: '16px', fontSize: '14px',
            fontFamily: 'sans-serif', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span><strong>Error:</strong> {error}</span>
            <button onClick={() => setError(null)} style={{
              background: 'none', border: 'none', color: C.errorText,
              cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '0 0 0 12px',
            }}>×</button>
          </div>
        )}

        {/* Create form */}
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="New task title..."
            style={{
              flex: 1, padding: '10px 13px', borderRadius: '6px',
              border: `1px solid ${C.inputBorder}`, background: C.inputBg,
              color: C.text, fontSize: '15px', outline: 'none', fontFamily: 'sans-serif',
            }}
          />
          <button type="submit" style={{
            padding: '10px 18px', background: C.accent, color: '#fff',
            border: 'none', borderRadius: '6px', cursor: 'pointer',
            fontSize: '15px', fontWeight: '600', fontFamily: 'sans-serif',
          }}>
            Add Task
          </button>
        </form>

        {isLoading && (
          <p style={{ color: C.textMuted, textAlign: 'center', fontFamily: 'sans-serif' }}>
            Loading tasks...
          </p>
        )}

        {!isLoading && tasks.length === 0 && (
          <p style={{ color: C.textMuted, textAlign: 'center', fontFamily: 'sans-serif' }}>
            No tasks found. Create one above!
          </p>
        )}

        {/* ── Pending ── */}
        {!isLoading && pending.length > 0 && (
          <TaskSection
            title={`Pending: ${pending.length}`}
            tasks={pending}
            status="pending"
            onCycle={handleCycleStatus}
            onDelete={handleDelete}
          />
        )}

        {/* ── Ongoing ── */}
        {!isLoading && ongoing.length > 0 && (
          <TaskSection
            title={`Ongoing: ${ongoing.length}`}
            tasks={ongoing}
            status="ongoing"
            onCycle={handleCycleStatus}
            onDelete={handleDelete}
          />
        )}

        {/* ── Completed ── */}
        {!isLoading && completed.length > 0 && (
          <TaskSection
            title={`Completed: ${completed.length}`}
            tasks={completed}
            status="completed"
            onCycle={handleCycleStatus}
            onDelete={handleDelete}
          />
        )}

      </div>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function TaskSection({ title, tasks, onCycle, onDelete, status }) {
  const theme = STATUS_THEME[status];
  return (
    <section style={{ marginBottom: '28px' }}>
      <h2 style={{
        fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
        letterSpacing: '0.1em', color: theme.headingColor, marginBottom: '10px',
        fontFamily: 'sans-serif', borderBottom: `1px solid ${theme.headingBorder}`,
        paddingBottom: '6px',
      }}>
        {title}
      </h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {tasks.map((task) => (
          <TaskRow key={task._id} task={task} onCycle={onCycle} onDelete={onDelete} />
        ))}
      </ul>
    </section>
  );
}

// ── timestamp formatter ───────────────────────────────────────────────────────
function fmt(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Task row ──────────────────────────────────────────────────────────────────
function TaskRow({ task, onCycle, onDelete }) {
  const status = task.status || 'pending';
  const theme = STATUS_THEME[status];
  const nextStatus = NEXT_STATUS[status];

  return (
    <li style={{
      display: 'flex', flexDirection: 'column',
      padding: '10px 14px', background: theme.rowBg, marginBottom: '8px',
      borderRadius: '8px', border: `1px solid ${theme.rowBorder}`,
      borderLeft: `4px solid ${theme.borderLeft}`, gap: '5px',
    }}>
      {/* main row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

        {/* Status icon */}
        <button
          onClick={() => onCycle(task)}
          title={`Mark as ${STATUS_LABEL[nextStatus]}`}
          style={{
            width: '28px', height: '28px', borderRadius: '50%', border: 'none',
            background: 'transparent', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          {status === 'pending' && (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8.5" stroke="#e07b30" strokeWidth="1.8"/>
            </svg>
          )}
          {status === 'ongoing' && (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8.5" stroke="#d4b040" strokeWidth="1.8"/>
              <line x1="6" y1="10" x2="14" y2="10" stroke="#d4b040" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          )}
          {status === 'completed' && (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="9" fill="#4a9e60"/>
              <polyline points="6,10.5 9,13.5 14,7.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>

        {/* Title */}
        <span style={{
          flexGrow: 1, fontSize: '15px', fontFamily: 'sans-serif',
          textDecoration: status === 'completed' ? 'line-through' : 'none',
          color: status === 'completed' ? C.textMuted : C.text,
        }}>
          {task.title}
        </span>

        {/* Delete */}
        <button onClick={() => onDelete(task._id)} style={{
          padding: '5px 11px', background: '#ef4444', color: '#fff',
          border: 'none', borderRadius: '4px', cursor: 'pointer',
          fontSize: '13px', fontFamily: 'sans-serif',
        }}>
          Delete
        </button>
      </div>

      {/* timestamps */}
      {(task.pendingAt || task.completedAt) && (
        <div style={{ display: 'flex', gap: '14px', paddingLeft: '40px', flexWrap: 'wrap' }}>
          {task.pendingAt && (
            <span style={{ fontSize: '10px', color: theme.headingColor, fontFamily: 'sans-serif', opacity: 0.75 }}>
              Pending: {fmt(task.pendingAt)}
            </span>
          )}
          {task.completedAt && (
            <span style={{ fontSize: '10px', color: '#70c080', fontFamily: 'sans-serif', opacity: 0.75 }}>
              Completed: {fmt(task.completedAt)}
            </span>
          )}
        </div>
      )}
    </li>
  );
}
