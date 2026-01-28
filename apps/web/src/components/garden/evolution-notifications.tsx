/**
 * EvolutionNotifications - Toast notifications for garden evolution events
 *
 * Displays subtle, non-intrusive notifications for:
 * - Plant germination events
 * - Entangled observation events
 *
 * Design philosophy: Calm, easily ignorable, never intrusive.
 * Positioned bottom-right corner, 3s duration, fade in/out animations.
 */

"use client";

import { useEffect } from "react";
import { useGardenStore } from "@/stores/garden-store";

interface NotificationProps {
  id: string;
  message: string;
  onDismiss: (id: string) => void;
}

/**
 * Single toast notification component.
 */
function Notification({ id, message, onDismiss }: NotificationProps) {
  useEffect(() => {
    // Auto-dismiss after 3 seconds
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [id, onDismiss]);

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
