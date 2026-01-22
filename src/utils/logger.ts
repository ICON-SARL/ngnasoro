/**
 * Conditional Logger Utility
 * 
 * Provides logging functions that only output in development mode.
 * Errors are always logged regardless of environment.
 */

const isDev = import.meta.env.DEV;

type LogArgs = unknown[];

interface Logger {
  log: (...args: LogArgs) => void;
  info: (...args: LogArgs) => void;
  warn: (...args: LogArgs) => void;
  error: (...args: LogArgs) => void;
  debug: (...args: LogArgs) => void;
  group: (label: string) => void;
  groupEnd: () => void;
  table: (data: unknown) => void;
}

export const logger: Logger = {
  log: (...args: LogArgs) => {
    if (isDev) console.log(...args);
  },
  
  info: (...args: LogArgs) => {
    if (isDev) console.info(...args);
  },
  
  warn: (...args: LogArgs) => {
    if (isDev) console.warn(...args);
  },
  
  // Errors are always logged for debugging in production
  error: (...args: LogArgs) => {
    console.error(...args);
  },
  
  debug: (...args: LogArgs) => {
    if (isDev) console.debug(...args);
  },
  
  group: (label: string) => {
    if (isDev) console.group(label);
  },
  
  groupEnd: () => {
    if (isDev) console.groupEnd();
  },
  
  table: (data: unknown) => {
    if (isDev) console.table(data);
  },
};

// Named export for specific log levels
export const logDev = logger.log;
export const logError = logger.error;
export const logWarn = logger.warn;
export const logDebug = logger.debug;

export default logger;
