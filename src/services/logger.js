const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const LEVEL = LOG_LEVELS[import.meta.env.VITE_LOG_LEVEL] ?? LOG_LEVELS.warn;

function log(level, component, action, message, meta) {
  if (LEVEL > level) return;
  const prefix = `[${component}] ${action}:`;
  const data = meta ? [prefix, message, meta] : [prefix, message];
  switch (level) {
    case LOG_LEVELS.debug: console.debug(...data); break;
    case LOG_LEVELS.info:  console.info(...data); break;
    case LOG_LEVELS.warn:  console.warn(...data); break;
    case LOG_LEVELS.error: console.error(...data); break;
  }
}

export const logger = {
  debug: (component, action, msg, meta) => log(LOG_LEVELS.debug, component, action, msg, meta),
  info:  (component, action, msg, meta) => log(LOG_LEVELS.info, component, action, msg, meta),
  warn:  (component, action, msg, meta) => log(LOG_LEVELS.warn, component, action, msg, meta),
  error: (component, action, msg, meta) => log(LOG_LEVELS.error, component, action, msg, meta),
};
