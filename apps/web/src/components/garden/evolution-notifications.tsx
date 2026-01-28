/**
 * EvolutionNotifications - Toast notifications for garden evolution events
 *
 * Displays subtle, non-intrusive notifications for:
 * - Plant germination events
 * - Entangled observation events
 *
 * Design philosophy: Calm, easily ignorable, never intrusive.
 * Positioned bottom-right corner, 5s duration, fade in/out animations.
 */

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useGardenStore } from "@/stores/garden-store";

/** Auto-dismiss duration in milliseconds */
const DISMISS_DURATION = 5000;

interface NotificationProps {
  id: string;
  message: string;
  onDismiss: (id: string) => void;
}

/**
 * Single toast notification component.
 * Supports pause-on-hover: timer pauses when user hovers over the notification.
 */
function Notification({ id, message, onDismiss }: NotificationProps) {
  const [isPaused, setIsPaused] = useState(false);
  const remainingTimeRef = useRef(DISMISS_DURATION);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Start or resume the dismiss timer
  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onDismiss(id);
    }, remainingTimeRef.current);
  }, [id, onDismiss]);

  // Pause the timer and save remaining time
  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      // Calculate remaining time
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
    }
  }, []);

  // Start timer on mount
  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [startTimer]);

  // Handle pause/resume based on hover state
  useEffect(() => {
    if (isPaused) {
      pauseTimer();
    } else {
      startTimer();
    }
  }, [isPaused, pauseTimer, startTimer]);

  return (
    <div
      className="
        mb-2 min-w-[240px] max-w-[320px]
        rounded-lg border border-green-500/20 bg-black/80 px-4 py-3
        text-sm text-green-100/90
        shadow-lg backdrop-blur-sm
        animate-in fade-in slide-in-from-right-5 duration-300
        hover:bg-black/90
        cursor-pointer transition-colors
      "
      onClick={() => onDismiss(id)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}

/**
 * Container for evolution event notifications.
 *
 * Displays toast messages in bottom-right corner for:
 * - Plant germination ("A plant has germinated")
 * - Entangled observations ("Entangled plants observed")
 */
export function EvolutionNotifications() {
  const { notifications, removeNotification } = useGardenStore();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div
      className="
        pointer-events-none fixed bottom-4 right-4 z-50
        flex flex-col items-end
      "
    >
      <div className="pointer-events-auto flex flex-col items-end">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            id={notification.id}
            message={notification.message}
            onDismiss={removeNotification}
          />
        ))}
      </div>
    </div>
  );
}
