import React, { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from './components/api';

// ── brown palette ─────────────────────────────────────────────────────────────
const C = {
  pageBg:      '#2c1a0e',   // dark espresso background
  cardBg:      '#3d2410',   // slightly lighter brown card
  rowBg:       '#4a2c14',   // task row background
  rowBorder:   '#6b3d1e',   // row border
  accent:      '#c8813a',   // warm amber-brown, Add Task button, left border incomplete
  accentHover: '#b06d2a',
  done:        '#8a6040',   // muted brown for completed left border
  text:        '#f5e6d3',   // warm cream text
  textMuted:   '#a07850',   // muted brown-tan
  inputBg:     '#2c1a0e',
  inputBorder: '#6b3d1e',
  errorBg:     '#5c1a1a',
  errorText:   '#ffaaaa',
  headingLine: '#6b3d1e',
};

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ------------------------------------------------------
  // 1. READ: Fetch all tasks on component mount
  // ------------------------------------------------------
  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const json = await getTasks();
      if (json.success) {
        setTasks(json.data);
      } else {
        setError(json.error || json.message || 'Failed to load tasks');
      }
    } catch (err) {
      setError('Network error. Is the Express backend running on port 5000?');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // ------------------------------------------------------
  // 2. CREATE: Add a new task
  // ------------------------------------------------------
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const numericId = Date.now();
      const json = await createTask({ id: numericId, title: newTaskTitle.trim() });

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
  // 3. UPDATE: Toggle completion status
  // ------------------------------------------------------
  const handleToggle = async (task) => {
    try {
      const json = await updateTask(task._id, { completed: !task.completed });

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
  // 4. DELETE: Remove a task
  // ------------------------------------------------------
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const json = await deleteTask(id);

      if (json.success) {
        setTasks(tasks.filter((t) => t._id !== id));
      } else {
        setError(json.error || json.message || 'Failed to delete task.');
      }
    } catch (err) {
      setError('Network error while deleting task.');
    }
  };

  const incomplete = tasks.filter((t) => !t.completed);
  const completed  = tasks.filter((t) => t.completed);

  return (
    <div style={{
      minHeight: '100vh',
      background: C.pageBg,
      padding: '40px 16px 80px',
    }}>
      <div style={{
        maxWidth: '560px',
        margin: '0 auto',
        fontFamily: 'Georgia, serif',
      }}>

        {/* Title */}
        <h1 style={{
          textAlign: 'center',
          marginBottom: '28px',
          fontSize: '26px',
          color: C.text,
          fontWeight: '700',
          letterSpacing: '0.5px',
        }}>
          Task Manager
        </h1>

        {/* Error banner */}
        {error && (
          <div style={{
            background: C.errorBg,
            color: C.errorText,
            padding: '10px 14px',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '14px',
            fontFamily: 'sans-serif',
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Create form */}
        <form
          onSubmit={handleCreate}
          style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}
        >
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="New task title..."
            style={{
              flex: 1,
              padding: '10px 13px',
              borderRadius: '6px',
              border: `1px solid ${C.inputBorder}`,
              background: C.inputBg,
              color: C.text,
              fontSize: '15px',
              outline: 'none',
              fontFamily: 'sans-serif',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '10px 18px',
              background: C.accent,
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              fontFamily: 'sans-serif',
            }}
          >
            Add Task
          </button>
        </form>

        {/* Loading */}
        {isLoading && (
          <p style={{ color: C.textMuted, textAlign: 'center', fontFamily: 'sans-serif' }}>
            Loading tasks...
          </p>
        )}

        {/* Empty state */}
        {!isLoading && tasks.length === 0 && (
          <p style={{ color: C.textMuted, textAlign: 'center', fontFamily: 'sans-serif' }}>
            No tasks found. Create one above!
          </p>
        )}

        {/* ── Incomplete tasks ── */}
        {!isLoading && incomplete.length > 0 && (
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: C.textMuted,
              marginBottom: '10px',
              fontFamily: 'sans-serif',
              borderBottom: `1px solid ${C.headingLine}`,
              paddingBottom: '6px',
            }}>
              Tasks: {incomplete.length}
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {incomplete.map((task) => (
                <TaskRow
                  key={task._id}
                  task={task}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          </section>
        )}

        {/* ── Completed tasks ── */}
        {!isLoading && completed.length > 0 && (
          <section>
            <h2 style={{
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: C.textMuted,
              marginBottom: '10px',
              fontFamily: 'sans-serif',
              borderBottom: `1px solid ${C.headingLine}`,
              paddingBottom: '6px',
            }}>
              Completed: {completed.length}
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {completed.map((task) => (
                <TaskRow
                  key={task._id}
                  task={task}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          </section>
        )}

      </div>
    </div>
  );
}

// ── Reusable task row ─────────────────────────────────────────────────────────
function TaskRow({ task, onToggle, onDelete }) {
  return (
    <li style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '11px 14px',
      background: C.rowBg,
      marginBottom: '8px',
      borderRadius: '8px',
      border: `1px solid ${C.rowBorder}`,
      borderLeft: task.completed ? `4px solid ${C.done}` : `4px solid ${C.accent}`,
    }}>
      <input
        type="checkbox"
        checked={task.completed || false}
        onChange={() => onToggle(task)}
        style={{ width: '17px', height: '17px', cursor: 'pointer', accentColor: C.accent }}
      />
      <span style={{
        flexGrow: 1,
        fontSize: '15px',
        fontFamily: 'sans-serif',
        textDecoration: task.completed ? 'line-through' : 'none',
        color: task.completed ? C.textMuted : C.text,
      }}>
        {task.title}
      </span>
      <button
        onClick={() => onDelete(task._id)}
        style={{
          padding: '5px 11px',
          background: '#ef4444',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '13px',
          fontFamily: 'sans-serif',
        }}
      >
        Delete
      </button>
    </li>
  );
}
