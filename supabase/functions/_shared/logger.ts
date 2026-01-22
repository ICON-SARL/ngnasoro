/**
 * Structured Logger for Edge Functions
 * 
 * Provides consistent logging format across all edge functions.
 * Outputs JSON in production for easier log aggregation.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  function: string;
  message: string;
  data?: unknown;
  error?: string;
  stack?: string;
}

const isDev = Deno.env.get('DENO_ENV') !== 'production';

function formatLog(entry: LogEntry): string {
  if (isDev) {
    const emoji = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌'
    }[entry.level];
    
    let output = `${emoji} [${entry.function}] ${entry.message}`;
    if (entry.data) {
      output += `\n${JSON.stringify(entry.data, null, 2)}`;
    }
    if (entry.error) {
      output += `\nError: ${entry.error}`;
    }
    return output;
  }
  
  // Production: JSON format for log aggregation
  return JSON.stringify(entry);
}

export function createLogger(functionName: string) {
  const log = (level: LogLevel, message: string, data?: unknown, error?: Error) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      function: functionName,
      message,
      data,
      error: error?.message,
      stack: error?.stack
    };
    
    const formatted = formatLog(entry);
    
    switch (level) {
      case 'debug':
        if (isDev) console.debug(formatted);
        break;
      case 'info':
        console.info(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
        console.error(formatted);
        break;
    }
  };
  
  return {
    debug: (message: string, data?: unknown) => log('debug', message, data),
    info: (message: string, data?: unknown) => log('info', message, data),
    warn: (message: string, data?: unknown) => log('warn', message, data),
    error: (message: string, error?: Error, data?: unknown) => log('error', message, data, error),
  };
}

export default createLogger;
