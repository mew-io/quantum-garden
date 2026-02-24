/**
 * EvolutionNotifications - Toast notifications for garden evolution events
 *
 * Displays subtle, non-intrusive notifications for:
 * - Plant germination events (green)
 * - Wave germination events (purple, with wave icon)
 * - Entangled observation events (pink, with chain icon)
 * - Error events (red/amber)
 *
 * Design philosophy: Calm, easily ignorable, never intrusive.
 * Positioned bottom-right corner, 5s duration, fade in/out animations.
 */

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useGardenStore, type NotificationType } from "@/stores/garden-store";
import { UI_TIMING } from "@quantum-garden/shared";

interface NotificationProps {
  id: string;
  message: string;
  type: NotificationType;
  onDismiss: (id: string) => void;
}

/**
 * Get Tailwind classes for notification styling based on type.
 */
function getNotificationStyles(type: NotificationType): string {
  // All notifications use consistent /90 background opacity for calm aesthetic
  switch (type) {
    case "wave":
      // Purple theme for wave germinations - special event
      return "border-purple-200/40 bg-purple-50/90 text-purple-800 hover:bg-purple-50/95 backdrop-blur-md";
    case "entanglement":
      // Pink theme for entanglement - quantum connection
      return "border-rose-200/40 bg-rose-50/90 text-rose-800 hover:bg-rose-50/95 backdrop-blur-md";
    case "error":
      // Amber/red theme for errors
      return "border-amber-200/40 bg-amber-50/90 text-amber-800 hover:bg-amber-50/95 backdrop-blur-md";
    case "germination":
    default:
      // Green theme for normal germinations
      return "border-emerald-200/40 bg-[--wc-cream]/90 text-emerald-800 hover:bg-[--wc-cream]/95 backdrop-blur-md";
  }
}

/**
 * Get icon for notification based on type.
 */
function NotificationIcon({ type }: { type: NotificationType }) {
  switch (type) {
    case "wave":
      // Wave icon (three horizontal lines suggesting wave motion)
      return (
        <svg
          className="mr-2 h-4 w-4 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
          />
        </svg>
      );
    case "entanglement":
      // Chain/link icon
      return (
        <svg
          className="mr-2 h-4 w-4 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      );
    case "error":
      // Warning/error icon
      return (
        <svg
          className="mr-2 h-4 w-4 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      );
    case "germination":
    default:
      // Sprout icon for germination
      return (
        <svg
          className="mr-2 h-4 w-4 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      );
  }
}

/**
 * Get progress bar color based on notification type.
 */
function getProgressBarColor(type: NotificationType): string {
  switch (type) {
    case "wave":
      return "bg-purple-400/50";
    case "entanglement":
      return "bg-rose-400/50";
    case "error":
      return "bg-amber-400/50";
    case "germination":
    default:
      return "bg-emerald-400/40";
  }
}

/**
 * Single toast notification component.
 * Supports pause-on-hover: timer pauses when user hovers over the notification.
 * Shows a progress bar indicating time until auto-dismiss.
 */
function Notification({ id, message, type, onDismiss }: NotificationProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const remainingTimeRef = useRef<number>(UI_TIMING.NOTIFICATION_DISMISS_MS);
  const totalDuration = UI_TIMING.NOTIFICATION_DISMISS_MS;
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Update progress bar using requestAnimationFrame for smooth animation
  const updateProgress = useCallback(() => {
    if (isPaused) return;

    const elapsed = Date.now() - startTimeRef.current;
    const currentRemaining = Math.max(0, remainingTimeRef.current - elapsed);
    const newProgress = (currentRemaining / totalDuration) * 100;
    setProgress(newProgress);

    if (newProgress > 0) {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }
  }, [isPaused, totalDuration]);

  // Start or resume the dismiss timer
  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onDismiss(id);
    }, remainingTimeRef.current);

    // Start progress animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(updateProgress);
  }, [id, onDismiss, updateProgress]);

  // Pause the timer and save remaining time
  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      // Calculate remaining time
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
    }
    // Stop progress animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Start timer on mount
  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
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

  const typeStyles = getNotificationStyles(type);

  const progressBarColor = getProgressBarColor(type);

  return (
    <div
      className={`
        mb-2 min-w-[240px] max-w-[320px]
        flex flex-col
        rounded-lg border
        text-sm
        shadow-lg backdrop-blur-sm
        animate-in fade-in slide-in-from-right-5 duration-400
        cursor-pointer transition-colors
        overflow-hidden
        ${typeStyles}
      `}
      onClick={() => onDismiss(id)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center px-4 py-3">
        <NotificationIcon type={type} />
        <span>{message}</span>
      </div>
      {/* Progress bar showing time until auto-dismiss */}
      <div className="h-0.5 w-full bg-black/20">
        <div
          className={`h-full transition-none ${progressBarColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
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
        pointer-events-none fixed bottom-[var(--inset-bottom)] right-[var(--inset-right)] z-50
        flex flex-col items-end
      "
    >
      <div className="pointer-events-auto flex flex-col items-end">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            id={notification.id}
            message={notification.message}
            type={notification.type}
            onDismiss={removeNotification}
          />
        ))}
      </div>
    </div>
  );
}
