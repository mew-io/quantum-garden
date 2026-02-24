"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { trpc } from "@/lib/trpc/client";
import { useGardenStore } from "@/stores/garden-store";
import type { EvolutionEvent } from "@/server/routers/garden";

interface TimeTravelScrubberProps {
  /** Whether time-travel mode is active */
  isActive: boolean;

  /** Called when scrubbing to a historical timestamp */
  onScrubToTime: (timestamp: Date) => void;

  /** Called when returning to live view */
  onReturnToLive: () => void;

  /** Garden creation timestamp (earliest possible time) */
  gardenCreatedAt: Date;
}

/**
 * Time-travel scrubber UI component.
 *
 * Provides a horizontal timeline with event markers and a draggable playhead.
 * Users can scrub through the garden's history to see evolution over time.
 *
 * Features:
 * - Timeline showing garden age (hours/days since creation)
 * - Event markers for germinations (green) and observations (blue)
 * - Draggable playhead to scrub through time
 * - Live/Historical mode toggle
 * - Auto-play evolution at 10x speed
 */
export function TimeTravelScrubber({
  isActive,
  onScrubToTime,
  onReturnToLive,
  gardenCreatedAt,
}: TimeTravelScrubberProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(10); // Default 10x speed
  const [hoveredEvent, setHoveredEvent] = useState<{
    event: EvolutionEvent;
    x: number;
  } | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const addNotification = useGardenStore((state) => state.addNotification);

  // Track "now" with periodic updates to keep timeline fresh
  // Updates every 10 seconds when timeline is active to avoid stale endpoints
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setNow(new Date());
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [isActive]);

  // Query evolution timeline
  const { data: events = [] } = trpc.garden.getEvolutionTimeline.useQuery(
    {
      startTime: gardenCreatedAt,
      endTime: now,
    },
    {
      enabled: isActive,
      refetchInterval: isActive ? 5000 : false, // Refresh every 5s when active
    }
  );

  // Calculate time range with minimum duration to prevent division by zero
  const timeRange = useMemo(() => {
    const start = gardenCreatedAt.getTime();
    const end = now.getTime();
    // Ensure minimum 1 second duration to prevent division by zero
    const duration = Math.max(1000, end - start);

    return { start, end, duration };
  }, [gardenCreatedAt, now]);

  // Format time label (e.g., "2h 15m" or "3d 4h")
  const formatTimeDuration = useCallback((ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      const remainingHours = hours % 24;
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    }

    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }

    if (minutes > 0) {
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    }

    return `${seconds}s`;
  }, []);

  // Handle scrubbing
  const handleScrub = useCallback(
    (clientX: number) => {
      if (!timelineRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const progress = Math.max(0, Math.min(1, relativeX / rect.width));

      // Calculate timestamp but ensure it doesn't exceed current time
      const targetTime = timeRange.start + progress * timeRange.duration;
      const clampedTime = Math.min(targetTime, now.getTime());
      const timestamp = new Date(clampedTime);

      setCurrentTime(timestamp);
      onScrubToTime(timestamp);
    },
    [timeRange, now, onScrubToTime]
  );

  // Mouse/touch handlers for dragging
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDraggingRef.current = true;
      handleScrub(e.clientX);

      // Capture pointer for smooth dragging
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [handleScrub]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current) return;
      handleScrub(e.clientX);
    },
    [handleScrub]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || !isActive) return;

    const interval = setInterval(() => {
      setCurrentTime((prevTime) => {
        const newTime = new Date(
          prevTime.getTime() + playbackSpeed * 1000 // Advance by playbackSpeed seconds/frame
        );

        // Stop at current time
        if (newTime >= now) {
          setIsPlaying(false);
          return now;
        }

        return newTime;
      });
    }, 100); // 10fps playback

    return () => clearInterval(interval);
  }, [isPlaying, isActive, playbackSpeed, now]);

  // Sync currentTime changes to parent (separate effect to avoid setState-in-render)
  useEffect(() => {
    if (isPlaying && isActive) {
      onScrubToTime(currentTime);
    }
  }, [currentTime, isPlaying, isActive, onScrubToTime]);

  // Calculate playhead position (clamped to 0-1 range)
  const playheadProgress = useMemo(() => {
    const progress = (currentTime.getTime() - timeRange.start) / timeRange.duration;
    return Math.max(0, Math.min(1, progress));
  }, [currentTime, timeRange]);

  // Render event markers
  const renderEventMarkers = useCallback(() => {
    return events.map((event: EvolutionEvent, index: number) => {
      // Clamp progress to 0-1 range to prevent markers outside timeline
      const rawProgress = (event.timestamp.getTime() - timeRange.start) / timeRange.duration;
      const progress = Math.max(0, Math.min(1, rawProgress));
      const left = `${progress * 100}%`;
      const leftPercent = progress * 100;

      const isGermination = event.type === "germination";
      const color = isGermination ? "rgb(34, 197, 94)" : "rgb(59, 130, 246)"; // green-500 or blue-500

      return (
        // Outer container provides 20px touch target while marker remains visually small
        <div
          key={`${event.type}-${event.plantId}-${index}`}
          className="absolute top-0 bottom-0 flex items-start justify-center cursor-pointer group"
          style={{ left, width: "20px", marginLeft: "-10px" }}
          onMouseEnter={() => setHoveredEvent({ event, x: leftPercent })}
          onMouseLeave={() => setHoveredEvent(null)}
        >
          {/* Visual marker line - 2px wide */}
          <div
            className="absolute top-0 bottom-0 w-0.5 opacity-60 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: color }}
          />
          {/* Visual marker dot - 10px wide */}
          <div
            className="absolute -top-1 w-2.5 h-2.5 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: color }}
          />
        </div>
      );
    });
  }, [events, timeRange]);

  if (!isActive) return null;

  return (
    <div className="fixed bottom-[var(--inset-bottom)] left-[var(--inset-left)] right-[var(--inset-right)] z-50 pointer-events-auto">
      {/* Timeline */}
      <div className="garden-panel rounded-t-xl !shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
          <div className="flex items-center gap-3">
            {/* Mode Indicator */}
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[--wc-ink] text-sm font-medium">Historical View</span>
            </div>
            {/* Current Time */}
            <span className="text-[--wc-ink-muted] text-sm">
              {formatTimeDuration(currentTime.getTime() - timeRange.start)} since creation
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Playback Speed Control */}
            <div className="flex items-center bg-black/5 rounded-lg p-0.5">
              {[1, 2, 5, 10, 20].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`
                    px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150
                    ${
                      playbackSpeed === speed
                        ? "bg-[--wc-bark] text-white scale-105"
                        : "text-[--wc-ink-muted] hover:text-[--wc-ink] hover:bg-black/8 active:scale-95"
                    }
                  `}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={playheadProgress >= 0.999}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  playheadProgress >= 0.999
                    ? "bg-black/5 text-[--wc-ink-muted]/50 cursor-not-allowed"
                    : "bg-black/8 text-[--wc-ink] hover:bg-black/12"
                }
              `}
            >
              {isPlaying ? "⏸ Pause" : "▶ Play"}
            </button>

            {/* Jump to Now */}
            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentTime(now);
                onScrubToTime(now);
              }}
              disabled={playheadProgress >= 0.999}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  playheadProgress >= 0.999
                    ? "bg-black/5 text-[--wc-ink-muted]/50 cursor-not-allowed"
                    : "bg-black/8 text-[--wc-ink] hover:bg-black/12"
                }
              `}
              title="Jump to current time"
            >
              ⏭ Now
            </button>

            {/* Exit Timeline */}
            <button
              onClick={() => {
                setIsPlaying(false);
                onReturnToLive();
                // Communicate that the garden evolved while they watched its past
                addNotification("The garden evolved while you watched its past", "germination");
              }}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 transition-colors"
            >
              Exit Timeline
            </button>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="px-4 py-4">
          {/* Timeline Track */}
          <div className="relative">
            <div
              ref={timelineRef}
              className="relative h-14 bg-black/5 rounded-lg cursor-pointer overflow-hidden border border-black/10"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              {/* Event Markers */}
              {renderEventMarkers()}

              {/* Progress Fill */}
              <div
                className="absolute top-0 left-0 bottom-0 bg-[--wc-bark]/15 transition-[width] duration-200 ease-out"
                style={{ width: `${playheadProgress * 100}%` }}
              />

              {/* Playhead */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-[--wc-bark] shadow-lg z-10"
                style={{ left: `${playheadProgress * 100}%` }}
              >
                {/* Playhead Handle */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-white rounded-full shadow-lg border-2 border-[--wc-bark]" />
              </div>

              {/* Event Tooltip */}
              {hoveredEvent && (
                <div
                  className="absolute bottom-full mb-3 px-3 py-2 bg-[--wc-cream] rounded-lg shadow-xl border border-[--wc-stone]/30 text-xs whitespace-nowrap pointer-events-none z-20 animate-in fade-in duration-150"
                  style={{
                    left: `${hoveredEvent.x}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          hoveredEvent.event.type === "germination"
                            ? "rgb(34, 197, 94)"
                            : "rgb(59, 130, 246)",
                      }}
                    />
                    <span className="text-[--wc-ink] font-medium">
                      {hoveredEvent.event.type === "germination" ? "Germination" : "Observation"}
                    </span>
                  </div>
                  <div className="text-[--wc-ink-muted] mt-1">
                    {hoveredEvent.event.timestamp.toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            {/* Timeline Labels */}
            <div className="flex justify-between mt-2 px-1 text-[--wc-ink-muted] text-xs">
              <span>Start</span>
              <span className="text-[--wc-ink-soft]">
                {formatTimeDuration(timeRange.duration)} elapsed
              </span>
              <span>Now</span>
            </div>
          </div>

          {/* Event Legend */}
          <div className="flex items-center gap-6 mt-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-[--wc-ink-muted]">Germination</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-[--wc-ink-muted]">Observation</span>
            </div>
            <div className="ml-auto text-[--wc-ink-muted]/60">{events.length} events</div>
          </div>
        </div>
      </div>
    </div>
  );
}
