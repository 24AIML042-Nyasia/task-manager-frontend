// Shared colour palette used across all pages
export const C = {
  pageBg:      '#2c1a0e',
  text:        '#f5e6d3',
  textMuted:   '#a07850',
  inputBg:     '#2c1a0e',
  inputBorder: '#6b3d1e',
  accent:      '#c8813a',
  errorBg:     '#5c1a1a',
  errorText:   '#ffaaaa',
  rowBorder:   '#6b3d1e',
  cardBg:      '#3d2410',
};

// Per-status visual theme
export const STATUS_THEME = {
  pending: {
    rowBg:        '#3d200a',
    rowBorder:    '#7a3a10',
    borderLeft:   '#e07b30',
    headingColor: '#e07b30',
    headingBorder:'#7a3a10',
  },
  ongoing: {
    rowBg:        '#2e2a0a',
    rowBorder:    '#6b5a10',
    borderLeft:   '#d4b040',
    headingColor: '#d4b040',
    headingBorder:'#6b5a10',
  },
  completed: {
    rowBg:        '#0f2a1a',
    rowBorder:    '#1e5c30',
    borderLeft:   '#4a9e60',
    headingColor: '#4a9e60',
    headingBorder:'#1e5c30',
  },
};

export const NEXT_STATUS = {
  pending:   'ongoing',
  ongoing:   'completed',
  completed: 'pending',
};

export const STATUS_LABEL = {
  pending:   'Pending',
  ongoing:   'Ongoing',
  completed: 'Completed',
};

export function fmt(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// Priority sort order — high first
export const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

export const PRIORITY_THEME = {
  high:   { bg: '#4a0a0a', text: '#ff8080', label: 'High' },
  medium: { bg: '#4a3a0a', text: '#f0d060', label: 'Medium' },
  low:    { bg: '#0a2a1a', text: '#70c080', label: 'Low' },
};
