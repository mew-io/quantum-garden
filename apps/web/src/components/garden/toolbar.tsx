"use client";

import { useState, useMemo } from "react";
import { useGardenStore } from "@/stores/garden-store";
import { useAudio } from "@/lib/audio";

/**
 * Check if debug mode is enabled via environment variable.
 * In production, debug features are hidden by default.
 */
const isDebugEnabled =
  process.env.NEXT_PUBLIC_DEBUG_ENABLED !== "false" && process.env.NODE_ENV !== "production";

/**
 * Toolbar - Persistent control bar for the Quantum Garden.
 *
 * Provides visible buttons for:
 * - Debug panel toggle (hidden in production)
 * - Time-travel toggle
 * - Help/info toggle
 * - Status indicator showing garden activity
 */

interface ToolbarProps {
  isDebugOpen: boolean;
  onDebugToggle: () => void;
  isTimeTravelAvailable: boolean;
  onShowHelp: () => void;
}

export function Toolbar({
  isDebugOpen,
  onDebugToggle,
  isTimeTravelAvailable,
  onShowHelp,
}: ToolbarProps) {
  const { isTimeTravelMode, setTimeTravelMode, plants } = useGardenStore();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const { isEnabled: isSoundEnabled, toggleEnabled: toggleSound, init: initAudio } = useAudio();

  // Handle sound toggle - must init on user gesture
  const handleSoundToggle = () => {
    initAudio();
    toggleSound();
  };

  // Use store data (kept fresh by usePlants hook's polling in GardenScene)
  // Memoize computed values to avoid recalculating on every render
  const { plantCount, germinatedCount, observedCount } = useMemo(
    () => ({
      plantCount: plants.length,
      germinatedCount: plants.filter((p) => p.germinatedAt !== null).length,
      observedCount: plants.filter((p) => p.observed).length,
    }),
    [plants]
  );

  // Toggle time travel
  const handleTimeTravelToggle = () => {
    if (isTimeTravelAvailable) {
      setTimeTravelMode(!isTimeTravelMode);
    }
  };

  return (
    <div className="fixed top-[var(--inset-top)] left-[var(--inset-left)] right-4 sm:right-auto z-50 flex flex-col gap-2">
      {/* Main Toolbar */}
      <div className="flex flex-wrap items-center gap-2 bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700/50 p-2 shadow-xl max-w-full overflow-hidden">
        {/* Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded">
          <span
            className={`w-2 h-2 rounded-full ${plantCount === 0 ? "bg-yellow-500 animate-pulse" : "bg-green-500 animate-organic-pulse"}`}
          />
          <span className="text-xs text-gray-400">
            {plantCount === 0 ? "Loading..." : `${plantCount} plants`}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-700" />

        {/* Help Button */}
        <ToolbarButton
          icon={<HelpIcon />}
          label="Help"
          shortcut="?"
          onClick={onShowHelp}
          active={false}
        />

        {/* Sound Toggle */}
        <ToolbarButton
          icon={isSoundEnabled ? <SpeakerOnIcon /> : <SpeakerOffIcon />}
          label={isSoundEnabled ? "Sound" : "Muted"}
          onClick={handleSoundToggle}
          active={isSoundEnabled}
          activeColor="cyan"
        />

        {/* Debug Button - hidden in production */}
        {isDebugEnabled && (
          <ToolbarButton
            icon={<BugIcon />}
            label="Debug"
            shortcut="`"
            onClick={onDebugToggle}
            active={isDebugOpen}
            activeColor="green"
          />
        )}

        {/* Time Travel Button */}
        <ToolbarButton
          icon={<ClockIcon />}
          label="Timeline"
          shortcut="T"
          onClick={handleTimeTravelToggle}
          active={isTimeTravelMode}
          activeColor="purple"
          disabled={!isTimeTravelAvailable}
        />

        {/* Keyboard Shortcuts Button */}
        <ToolbarButton
          icon={<KeyboardIcon />}
          label="Keys"
          onClick={() => setShowShortcuts(!showShortcuts)}
          active={showShortcuts}
          activeColor="blue"
        />
      </div>

      {/* Garden Status Bar */}
      <div className="hidden sm:flex items-center gap-3 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-700/50 px-3 py-2 shadow-lg text-xs">
        <StatusItem
          icon={<SeedIcon />}
          label="Dormant"
          value={plantCount - germinatedCount}
          color="gray"
        />
        <StatusItem icon={<SproutIcon />} label="Growing" value={germinatedCount} color="green" />
        <StatusItem icon={<EyeIcon />} label="Observed" value={observedCount} color="cyan" />
      </div>

      {/* Keyboard Shortcuts Panel */}
      {showShortcuts && (
        <div className="bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 max-w-xs">
          <h3 className="text-gray-200 text-sm font-medium mb-3">Keyboard Shortcuts</h3>

          {/* General shortcuts */}
          <div className="space-y-2">
            <ShortcutRow shortcut="?" description="Show help" />
            <ShortcutRow shortcut="T" description="Toggle timeline" />
            <ShortcutRow shortcut="`" description="Toggle debug panel" />
            <ShortcutRow shortcut="Esc" description="Close panels" />
          </div>

          {/* Event log navigation */}
          <div className="mt-4 pt-3 border-t border-gray-700/50">
            <h4 className="text-gray-400 text-xs uppercase tracking-wide mb-2">Event Navigation</h4>
            <div className="space-y-2">
              <ShortcutRow shortcut="←" description="Previous event" />
              <ShortcutRow shortcut="→" description="Next event" />
            </div>
          </div>

          {/* Interaction hint */}
          <div className="mt-4 pt-3 border-t border-gray-700/50">
            <h4 className="text-gray-400 text-xs uppercase tracking-wide mb-2">Observation</h4>
            <p className="text-gray-500 text-xs leading-relaxed">
              The reticle drifts across the garden. When it aligns with a plant, observation begins
              automatically.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Toolbar Button Component
interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
  active?: boolean;
  activeColor?: "green" | "purple" | "blue" | "cyan";
  disabled?: boolean;
}

function ToolbarButton({
  icon,
  label,
  shortcut,
  onClick,
  active = false,
  activeColor = "green",
  disabled = false,
}: ToolbarButtonProps) {
  const activeClasses = {
    green: "bg-green-600/30 text-green-400 border-green-500/50",
    purple: "bg-purple-600/30 text-purple-400 border-purple-500/50",
    blue: "bg-blue-600/30 text-blue-400 border-blue-500/50",
    cyan: "bg-cyan-600/30 text-cyan-400 border-cyan-500/50",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded border transition-all
        ${
          disabled
            ? "opacity-40 cursor-not-allowed bg-gray-800/30 border-gray-700/30 text-gray-600"
            : active
              ? activeClasses[activeColor]
              : "bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/50 hover:text-gray-100"
        }
      `}
      title={shortcut ? `${label} (${shortcut})` : label}
    >
      {icon}
      <span className="hidden min-[400px]:inline text-xs font-medium">{label}</span>
      {shortcut && (
        <kbd className="hidden sm:inline-block ml-1 px-1 py-0.5 text-[10px] bg-gray-900/50 rounded text-gray-500">
          {shortcut}
        </kbd>
      )}
    </button>
  );
}

// Status Item Component
function StatusItem({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "gray" | "green" | "cyan" | "purple";
}) {
  const colorClasses = {
    gray: "text-gray-400",
    green: "text-green-400",
    cyan: "text-cyan-400",
    purple: "text-purple-400",
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className={colorClasses[color]}>{icon}</span>
      <span className="text-gray-500">{label}:</span>
      <span className={`font-mono ${colorClasses[color]}`}>{value}</span>
    </div>
  );
}

// Shortcut Row Component
function ShortcutRow({ shortcut, description }: { shortcut: string; description: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-400 text-xs">{description}</span>
      <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300 text-xs font-mono">
        {shortcut}
      </kbd>
    </div>
  );
}

// Icons
function HelpIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" />
    </svg>
  );
}

function BugIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M8 2l1.88 1.88M14.12 3.88L16 2M9 7.13v-1a3.003 3.003 0 116 0v1" />
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 014-4h4a4 4 0 014 4v3c0 3.3-2.7 6-6 6z" />
      <path d="M12 20v-9M6.53 9C4.6 8.8 3 7.1 3 5M6 13H3M6 17l-3 1M17.47 9c1.93-.2 3.53-1.9 3.53-4M18 13h3M18 17l3 1" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function KeyboardIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10" />
    </svg>
  );
}

function SeedIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 22c4-4 8-7.582 8-12a8 8 0 10-16 0c0 4.418 4 8 8 12z" />
      <path d="M12 12v6" />
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

function SpeakerOnIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function SpeakerOffIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}
