"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useGardenStore } from "@/stores/garden-store";
import type { QuantumEvent, QuantumEventType } from "@quantum-garden/shared";
import { generateExplanation } from "@/lib/quantum-explanations";
import {
  EyeIcon,
  SproutIcon,
  ChainIcon,
  WaveIcon,
  SkullIcon,
  ChevronRightIcon,
  WaitingIcon,
} from "@/components/garden/icons";

const EVENT_CONFIG: Record<
  QuantumEventType,
  { icon: React.ReactNode; color: string; label: string }
> = {
  observation: { icon: <EyeIcon />, color: "text-cyan-700", label: "Observation" },
  germination: { icon: <SproutIcon />, color: "text-emerald-700", label: "Germination" },
  entanglement: { icon: <ChainIcon />, color: "text-purple-700", label: "Entanglement" },
  wave_germination: { icon: <WaveIcon />, color: "text-blue-700", label: "Wave" },
  death: { icon: <SkullIcon />, color: "text-[--wc-ink-muted]", label: "Death" },
};

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

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getEventDescription(event: QuantumEvent): string {
  return generateExplanation(event).summary;
}

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
            ? "bg-black/8 border border-[--wc-stone]/40"
            : "hover:bg-black/5 border border-transparent"
        }
      `}
    >
      <span className={config.color}>{config.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[--wc-ink] truncate">{getEventDescription(event)}</p>
        <p className="text-[10px] text-[--wc-ink-muted]">{formatRelativeTime(event.timestamp)}</p>
      </div>
      <ChevronRightIcon />
    </button>
  );
}

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
        transition-colors whitespace-nowrap flex-shrink-0
        ${
          active
            ? `${config.color} bg-black/8 border border-current/30`
            : "text-[--wc-ink-muted] hover:text-[--wc-ink-soft] border border-transparent"
        }
      `}
    >
      {config.icon}
      <span>{config.label}</span>
    </button>
  );
}

export function EventsTab() {
  const { eventLog, selectedEventId, setSelectedEventId } = useGardenStore();
  const [activeFilters, setActiveFilters] = useState<Set<QuantumEventType>>(
    new Set(["observation", "germination", "entanglement", "wave_germination", "death"])
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const wasAtBottomRef = useRef(true);

  const filteredEvents = eventLog.filter((e) => activeFilters.has(e.type));

  const toggleFilter = useCallback((type: QuantumEventType) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size > 1) next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

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

  useEffect(() => {
    if (filteredEvents.length > 0 && wasAtBottomRef.current && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [filteredEvents]);

  const handleEventClick = useCallback(
    (eventId: string) => {
      setSelectedEventId(eventId);
    },
    [setSelectedEventId]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-[--wc-stone]/20 flex-shrink-0">
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
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto min-h-0 px-2 py-2 space-y-1">
        {eventLog.length === 0 ? (
          <div className="text-center py-6 px-4">
            <div className="text-[--wc-stone] mb-3">
              <WaitingIcon />
            </div>
            <p className="text-xs text-[--wc-ink-muted] mb-1">Awaiting quantum events</p>
            <p className="text-[10px] text-[--wc-stone]">
              Events will appear here when plants germinate or are observed
            </p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <p className="text-center text-xs text-[--wc-ink-muted] py-4">No events match filters</p>
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
    </div>
  );
}
