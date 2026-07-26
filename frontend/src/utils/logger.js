/**
 * ChatFrame Frontend Logger
 * Forwards logs to the terminal via backend /api/dev/log and suppresses console noise in browser.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const sendToTerminal = (level, message, meta) => {
  try {
    fetch(`${API_BASE_URL}/dev/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level, message, meta, source: 'frontend' }),
    }).catch(() => {});
  } catch (err) {
    // Ignore logging failures
  }
};

export const logger = {
  info: (message, meta) => {
    sendToTerminal('info', message, meta);
  },
  warn: (message, meta) => {
    sendToTerminal('warn', message, meta);
  },
  error: (message, meta) => {
    sendToTerminal('error', message, meta);
  },
};

export default logger;
