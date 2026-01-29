/**
 * CooldownIndicator - Visual feedback during observation cooldown period
 *
 * Shows a subtle radial progress indicator when the observation system
 * is in cooldown after an observation. This helps users understand
 * why they can't observe another plant immediately.
 *
 * Positioned in the bottom-left corner, opposite to notifications.
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { useGardenStore } from "@/stores/garden-store";

/** Default cooldown duration in seconds (matches observation-system.ts) */
const COOLDOWN_DURATION = 17.5;

/**
 * Cooldown indicator component.
 *
 * Displays a circular progress indicator during the post-observation
 * cooldown period. The ring depletes as cooldown progresses.
 */
export function CooldownIndicator() {
  const { isInCooldown } = useGardenStore();
  const [progress, setProgress] = useState(1); // 1 = full, 0 = empty
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isInCooldown) {
      // Start cooldown animation
      startTimeRef.current = Date.now();

      const animate = () => {
        if (!startTimeRef.current) return;

        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const remaining = Math.max(0, 1 - elapsed / COOLDOWN_DURATION);

        setProgress(remaining);

        if (remaining > 0) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    } else {
      // Reset when cooldown ends
      setProgress(1);
      startTimeRef.current = null;
    }
  }, [isInCooldown]);

  // Don't render when not in cooldown
  if (!isInCooldown) {
    return null;
  }

  // SVG circle properties
  const size = 48;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div
      className="
        fixed bottom-[var(--inset-bottom)] left-[var(--inset-left)] z-40
        flex items-center gap-2
        pointer-events-none
        animate-in fade-in duration-300
      "
      role="status"
      aria-label={`Cooldown: ${Math.ceil(progress * COOLDOWN_DURATION)} seconds remaining`}
    >
      {/* Circular progress indicator */}
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg width={size} height={size} className="absolute transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={strokeWidth}
          />
        </svg>

        {/* Progress circle */}
        <svg width={size} height={size} className="absolute transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(168, 85, 247, 0.7)" // Purple to match quantum theme
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 0.25s ease-out" }}
          />
        </svg>

        {/* Center icon - hourglass/timer */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(168, 85, 247, 0.8)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
          </svg>
        </div>
      </div>

      {/* Optional label */}
      <div className="hidden sm:block text-xs text-purple-400/80 font-mono">
        {Math.ceil(progress * COOLDOWN_DURATION)}s
      </div>
    </div>
  );
}
