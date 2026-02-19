/**
 * QuantumEventLog - Persistent panel showing quantum events as they happen
 *
 * Displays a scrollable list of all quantum events (observations, germinations,
 * entanglement correlations) with filtering and history navigation.
 * Each event can be clicked to open a detail modal with educational content.
 */

"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useGardenStore } from "@/stores/garden-store";
import type { QuantumEvent, QuantumEventType } from "@quantum-garden/shared";
import { generateExplanation } from "@/lib/quantum-explanations";

/**
 * Event type configuration for icons and colors.
 */
const EVENT_CONFIG: Record<
  QuantumEventType,
  { icon: React.ReactNode; color: string; label: string }
> = {
  observation: {
    icon: <EyeIcon />,
    color: "text-cyan-400",
    label: "Observation",
  },
  germination: {
    icon: <SproutIcon />,
    color: "text-green-400",
    label: "Germination",
  },
  entanglement: {
    icon: <ChainIcon />,
    color: "text-purple-400",
    label: "Entanglement",
  },
  wave_germination: {
    icon: <WaveIcon />,
    color: "text-blue-400",
    label: "Wave",
  },
  death: {
    icon: <SkullIcon />,
    color: "text-gray-400",
    label: "Death",
  },
};

/**
 * Format a timestamp as a relative time string with full timestamp for historical events.
 */
function formatRelativeTime(timestamp: Date): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;

  // For historical events, show both date and time
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Get a brief description for an event using centralized explanations.
 */
function getEventDescription(event: QuantumEvent): string {
  return generateExplanation(event).summary;
}

/**
 * Individual event row component.
 */
function EventItem({
  event,
  isSelected,
  onClick,
}: {
  event: QuantumEvent;
  isSelected: boolean;
  onClick: () => void;
}) {
  const config = EVENT_CONFIG[event.type];

  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-2 px-3 py-2 rounded
        text-left transition-colors
        ${
          isSelected
            ? "bg-green-500/20 border border-green-500/30"
            : "hover:bg-white/5 border border-transparent"
        }
      `}
    >
      <span className={config.color}>{config.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-green-100/90 truncate">{getEventDescription(event)}</p>
        <p className="text-[10px] text-green-100/40">{formatRelativeTime(event.timestamp)}</p>
      </div>
      <ChevronRightIcon />
    </button>
  );
}

/**
 * Filter chip component.
 */
function FilterChip({
  type,
  active,
  onClick,
}: {
  type: QuantumEventType;
  active: boolean;
  onClick: () => void;
}) {
  const config = EVENT_CONFIG[type];

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium
        transition-colors
        ${
          active
            ? `${config.color} bg-white/10 border border-current/30`
            : "text-green-100/40 hover:text-green-100/60 border border-transparent"
        }
      `}
    >
      {config.icon}
      <span className="hidden sm:inline">{config.label}</span>
    </button>
  );
}

/**
 * Main QuantumEventLog panel component.
 */
export function QuantumEventLog() {
  const { eventLog, selectedEventId, setSelectedEventId, isTimeTravelMode } = useGardenStore();
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<QuantumEventType>>(
    new Set(["observation", "germination", "entanglement", "wave_germination", "death"])
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const wasAtBottomRef = useRef(true);

  // Filter events based on active filters
  const filteredEvents = eventLog.filter((e) => activeFilters.has(e.type));

  // Toggle a filter
  const toggleFilter = useCallback((type: QuantumEventType) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        // Don't allow removing all filters
        if (next.size > 1) {
          next.delete(type);
        }
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  // Check if scrolled to bottom before update
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScroll = () => {
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 20;
      wasAtBottomRef.current = isAtBottom;
    };

    container.addEventListener("scroll", checkScroll);
    return () => container.removeEventListener("scroll", checkScroll);
  }, []);

  // Auto-scroll to bottom when new events arrive (but don't auto-select/open modal)
  useEffect(() => {
    if (filteredEvents.length > 0) {
      // Auto-scroll if at bottom
      if (wasAtBottomRef.current && scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    }
  }, [filteredEvents]);

  // Handle event selection
  const handleEventClick = useCallback(
    (eventId: string) => {
      setSelectedEventId(eventId);
    },
    [setSelectedEventId]
  );

  // Adjust bottom position when timeline is visible
  const bottomOffset = isTimeTravelMode
    ? "calc(var(--inset-bottom) + 180px)"
    : "var(--inset-bottom)";

  return (
    <div
      className="
        pointer-events-none fixed left-[var(--inset-left)] z-40
        flex flex-col items-start transition-all duration-300
      "
      style={{ bottom: bottomOffset }}
    >
      <div
        className={`
          pointer-events-auto w-[320px] rounded-lg border border-green-500/20
          bg-black/85 shadow-xl backdrop-blur-md
          animate-in slide-in-from-left-5 duration-300
          ${isMinimized ? "" : "max-h-[400px]"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-green-500/10">
          <div className="flex items-center gap-2">
            <QuantumIcon />
            <h3 className="text-sm font-medium text-green-100">Quantum Events</h3>
            <span className="text-[10px] text-green-100/40 bg-green-500/10 px-1.5 py-0.5 rounded-full">
              {filteredEvents.length}
            </span>
          </div>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-green-100/40 hover:text-green-100/80 transition-colors p-1"
            aria-label={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </button>
        </div>

        {!isMinimized && (
          <>
            {/* Filter chips */}
            <div className="flex items-center gap-1 px-3 py-2 border-b border-green-500/10 overflow-x-auto">
              {(Object.keys(EVENT_CONFIG) as QuantumEventType[]).map((type) => (
                <FilterChip
                  key={type}
                  type={type}
                  active={activeFilters.has(type)}
                  onClick={() => toggleFilter(type)}
                />
              ))}
            </div>

            {/* Event list */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto max-h-[280px] px-2 py-2 space-y-1"
            >
              {eventLog.length === 0 ? (
                <div className="text-center py-6 px-4">
                  <div className="text-green-100/20 mb-3">
                    <WaitingIcon />
                  </div>
                  <p className="text-xs text-green-100/50 mb-1">Awaiting quantum events</p>
                  <p className="text-[10px] text-green-100/30">
                    Events will appear here when plants germinate or are observed
                  </p>
                </div>
              ) : filteredEvents.length === 0 ? (
                <p className="text-center text-xs text-green-100/40 py-4">
                  No events match filters
                </p>
              ) : (
                filteredEvents.map((event) => (
                  <EventItem
                    key={event.id}
                    event={event}
                    isSelected={selectedEventId === event.id}
                    onClick={() => handleEventClick(event.id)}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Icons
function EyeIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function SproutIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M7 20h10M12 20v-8" />
      <path d="M12 12c-3 0-5-2-5-5 2 0 5 2 5 5z" />
      <path d="M12 12c3 0 5-2 5-5-2 0-5 2-5 5z" />
    </svg>
  );
}

function ChainIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function WaveIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M2 12c.6-.5 1.5-1 2.5-1s2 1 3 1 2-.5 3-1 2-1 3-1 2 .5 3 1 2 1 3 1 1.9-.5 2.5-1" />
      <path d="M2 6c.6-.5 1.5-1 2.5-1s2 1 3 1 2-.5 3-1 2-1 3-1 2 .5 3 1 2 1 3 1 1.9-.5 2.5-1" />
      <path d="M2 18c.6-.5 1.5-1 2.5-1s2 1 3 1 2-.5 3-1 2-1 3-1 2 .5 3 1 2 1 3 1 1.9-.5 2.5-1" />
    </svg>
  );
}

function SkullIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 3a8 8 0 0 0-8 8v4a2 2 0 0 0 2 2h1v-2a2 2 0 0 1 2-2 2 2 0 0 1 2 2v2h2v-2a2 2 0 0 1 2-2 2 2 0 0 1 2 2v2h1a2 2 0 0 0 2-2v-4a8 8 0 0 0-8-8z" />
      <circle cx="9" cy="10" r="1" />
      <circle cx="15" cy="10" r="1" />
    </svg>
  );
}

function QuantumIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="3" />
      <ellipse cx="12" cy="12" rx="10" ry="4" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-green-100/20"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function WaitingIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="mx-auto animate-pulse"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}
