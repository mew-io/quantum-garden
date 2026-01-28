"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { trpc } from "@/lib/trpc/client";
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed] = useState(10); // 10x speed
  const [hoveredEvent, setHoveredEvent] = useState<{
    event: EvolutionEvent;
    x: number;
  } | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // Track "now" with periodic updates to keep timeline fresh
  // Updates every 10 seconds when timeline is expanded to avoid stale endpoints
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!isExpanded) return;

    const interval = setInterval(() => {
      setNow(new Date());
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [isExpanded]);

  // Query evolution timeline
  const { data: events = [] } = trpc.garden.getEvolutionTimeline.useQuery(
    {
      startTime: gardenCreatedAt,
      endTime: now,
    },
    {
      enabled: isActive && isExpanded,
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

        onScrubToTime(newTime);
        return newTime;
      });
    }, 100); // 10fps playback

    return () => clearInterval(interval);
  }, [isPlaying, isActive, playbackSpeed, now, onScrubToTime]);

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
    <div
      className="fixed bottom-0 left-0 right-0 z-50 pointer-events-auto"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      {/* Collapse/Expand Toggle */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="absolute left-1/2 -translate-x-1/2 px-4 py-2 bg-black/80 text-white/90 rounded-full text-sm backdrop-blur-sm hover:bg-black/90 transition-colors"
          style={{ bottom: "max(1rem, var(--safe-bottom))" }}
        >
          Show Timeline
        </button>
      )}

      {/* Expanded Timeline */}
      {isExpanded && (
        <div className="bg-black/80 backdrop-blur-md border-t border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-4">
            {/* Controls Row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                {/* Mode Indicator */}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-white/90 text-sm font-medium">Historical View</span>
                </div>

                {/* Current Time */}
                <div className="text-white/60 text-sm">
                  {formatTimeDuration(currentTime.getTime() - timeRange.start)} since creation
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Play/Pause */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3 py-1.5 bg-white/10 text-white/90 rounded text-sm hover:bg-white/20 transition-colors"
                  disabled={playheadProgress >= 1}
                >
                  {isPlaying ? "Pause" : "Play"} (10x)
                </button>

                {/* Exit Timeline */}
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    onReturnToLive();
                  }}
                  className="px-3 py-1.5 bg-emerald-600/80 text-white rounded text-sm hover:bg-emerald-600 transition-colors"
                >
                  Exit Timeline
                </button>

                {/* Collapse */}
                <button
                  onClick={() => setIsExpanded(false)}
                  className="px-3 py-1.5 bg-white/10 text-white/90 rounded text-sm hover:bg-white/20 transition-colors"
                >
                  Hide
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Timeline Track */}
              <div
                ref={timelineRef}
                className="relative h-12 bg-white/5 rounded-lg cursor-pointer overflow-hidden"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                {/* Event Markers */}
                {renderEventMarkers()}

                {/* Playhead */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10"
                  style={{ left: `${playheadProgress * 100}%` }}
                >
                  {/* Playhead Handle */}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-lg" />
                </div>

                {/* Progress Fill */}
                <div
                  className="absolute top-0 left-0 bottom-0 bg-white/10"
                  style={{ width: `${playheadProgress * 100}%` }}
                />

                {/* Event Tooltip */}
                {hoveredEvent && (
                  <div
                    className="absolute bottom-full mb-2 px-3 py-2 bg-gray-900/95 rounded-lg shadow-lg border border-white/10 text-xs whitespace-nowrap pointer-events-none z-20"
                    style={{
                      left: `${hoveredEvent.x}%`,
                      transform: "translateX(-50%)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            hoveredEvent.event.type === "germination"
                              ? "rgb(34, 197, 94)"
                              : "rgb(59, 130, 246)",
                        }}
                      />
                      <span className="text-white/90 font-medium">
                        {hoveredEvent.event.type === "germination" ? "Germination" : "Observation"}
                      </span>
                    </div>
                    <div className="text-white/60 mt-1">
                      {hoveredEvent.event.timestamp.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline Labels */}
              <div className="flex justify-between mt-2 text-white/40 text-xs">
                <span>Start</span>
                <span>{formatTimeDuration(timeRange.duration)} elapsed</span>
                <span>Now</span>
              </div>
            </div>

            {/* Event Legend */}
            <div className="flex items-center gap-4 mt-4 text-xs text-white/60">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Germination</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Observation</span>
              </div>
              <div className="ml-auto">{events.length} events</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
