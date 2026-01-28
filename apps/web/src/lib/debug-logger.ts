/**
 * DebugLogger - Centralized logging system with UI integration
 *
 * Provides categorized logging that can be displayed in the debug panel.
 * Logs are captured in memory and can be retrieved for display.
 *
 * Categories:
 * - quantum: Quantum pool and circuit operations
 * - observation: Observation system events
 * - evolution: Garden evolution and germination
 * - rendering: Three.js and visual rendering
 * - system: General system events
 */

export type LogLevel = "debug" | "info" | "warn" | "error";
export type LogCategory = "quantum" | "observation" | "evolution" | "rendering" | "system";

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: unknown;
}

const MAX_LOGS = 100;

class DebugLogger {
  private logs: LogEntry[] = [];
  private listeners: Set<(logs: LogEntry[]) => void> = new Set();
  private enabled = true;

  /**
   * Enable or disable logging.
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Subscribe to log updates.
   */
  subscribe(listener: (logs: LogEntry[]) => void): () => void {
    this.listeners.add(listener);
    // Immediately send current logs to new subscriber
    listener(this.logs);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get all current logs.
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear all logs.
   */
  clear(): void {
    this.logs = [];
    this.notifyListeners();
  }

  /**
   * Log a message.
   */
  log(level: LogLevel, category: LogCategory, message: string, data?: unknown): void {
    if (!this.enabled) return;

    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: new Date(),
      level,
      category,
      message,
      data,
    };

    this.logs.push(entry);

    // Trim to max size
    if (this.logs.length > MAX_LOGS) {
      this.logs = this.logs.slice(-MAX_LOGS);
    }

    // Also log to console with appropriate method
    const consoleMethod =
      level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    const prefix = `[${category.toUpperCase()}]`;
    if (data !== undefined) {
      consoleMethod(prefix, message, data);
    } else {
      consoleMethod(prefix, message);
    }

    this.notifyListeners();
  }

  private notifyListeners(): void {
    const currentLogs = this.getLogs();
    this.listeners.forEach((listener) => listener(currentLogs));
  }

  // Convenience methods for each category and level
  quantum = {
    debug: (message: string, data?: unknown) => this.log("debug", "quantum", message, data),
    info: (message: string, data?: unknown) => this.log("info", "quantum", message, data),
    warn: (message: string, data?: unknown) => this.log("warn", "quantum", message, data),
    error: (message: string, data?: unknown) => this.log("error", "quantum", message, data),
  };

  observation = {
    debug: (message: string, data?: unknown) => this.log("debug", "observation", message, data),
    info: (message: string, data?: unknown) => this.log("info", "observation", message, data),
    warn: (message: string, data?: unknown) => this.log("warn", "observation", message, data),
    error: (message: string, data?: unknown) => this.log("error", "observation", message, data),
  };

  evolution = {
    debug: (message: string, data?: unknown) => this.log("debug", "evolution", message, data),
    info: (message: string, data?: unknown) => this.log("info", "evolution", message, data),
    warn: (message: string, data?: unknown) => this.log("warn", "evolution", message, data),
    error: (message: string, data?: unknown) => this.log("error", "evolution", message, data),
  };

  rendering = {
    debug: (message: string, data?: unknown) => this.log("debug", "rendering", message, data),
    info: (message: string, data?: unknown) => this.log("info", "rendering", message, data),
    warn: (message: string, data?: unknown) => this.log("warn", "rendering", message, data),
    error: (message: string, data?: unknown) => this.log("error", "rendering", message, data),
  };

  system = {
    debug: (message: string, data?: unknown) => this.log("debug", "system", message, data),
    info: (message: string, data?: unknown) => this.log("info", "system", message, data),
    warn: (message: string, data?: unknown) => this.log("warn", "system", message, data),
    error: (message: string, data?: unknown) => this.log("error", "system", message, data),
  };
}

// Singleton instance
export const debugLogger = new DebugLogger();

// React hook for using logs
import { useState, useEffect } from "react";

export function useDebugLogs(): LogEntry[] {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    return debugLogger.subscribe(setLogs);
  }, []);

  return logs;
}

/**
 * Filter logs by category and/or level.
 */
export function filterLogs(
  logs: LogEntry[],
  options: { categories?: LogCategory[]; levels?: LogLevel[] }
): LogEntry[] {
  return logs.filter((log) => {
    if (options.categories && !options.categories.includes(log.category)) {
      return false;
    }
    if (options.levels && !options.levels.includes(log.level)) {
      return false;
    }
    return true;
  });
}
