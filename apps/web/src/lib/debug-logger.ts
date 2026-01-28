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

/**
 * CircularBuffer - Fixed-size buffer with O(1) add and automatic overwrite of oldest entries.
 *
 * Uses a head pointer to track the next write position. When full, new entries
 * overwrite the oldest ones. Avoids array slice/copy operations on every add.
 */
class CircularBuffer<T> {
  private buffer: (T | undefined)[];
  private head = 0; // Next write position
  private count = 0; // Current number of entries (up to capacity)
  private readonly capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.buffer = new Array(capacity);
  }

  /**
   * Add an entry to the buffer. If full, overwrites the oldest entry.
   */
  push(entry: T): void {
    this.buffer[this.head] = entry;
    this.head = (this.head + 1) % this.capacity;
    if (this.count < this.capacity) {
      this.count++;
    }
  }

  /**
   * Get all entries in order (oldest first).
   */
  toArray(): T[] {
    if (this.count === 0) return [];

    const result: T[] = [];
    // Start from the oldest entry
    const start = this.count < this.capacity ? 0 : this.head;
    for (let i = 0; i < this.count; i++) {
      const index = (start + i) % this.capacity;
      result.push(this.buffer[index] as T);
    }
    return result;
  }

  /**
   * Clear all entries.
   */
  clear(): void {
    this.buffer = new Array(this.capacity);
    this.head = 0;
    this.count = 0;
  }

  /**
   * Get the number of entries currently in the buffer.
   */
  get length(): number {
    return this.count;
  }
}

class DebugLogger {
  private logs: CircularBuffer<LogEntry> = new CircularBuffer(MAX_LOGS);
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
    listener(this.logs.toArray());
    return () => this.listeners.delete(listener);
  }

  /**
   * Get all current logs.
   */
  getLogs(): LogEntry[] {
    return this.logs.toArray();
  }

  /**
   * Clear all logs.
   */
  clear(): void {
    this.logs.clear();
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
