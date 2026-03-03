"use client";

import { useState, useMemo } from "react";
import { useGardenStore } from "@/stores/garden-store";
import { useAudio } from "@/lib/audio";

/**
 * Check if debug mode is enabled via environment variable.
 * Set NEXT_PUBLIC_DEBUG_ENABLED=false to hide debug features.
 */
const isDebugEnabled = process.env.NEXT_PUBLIC_DEBUG_ENABLED !== "false";

/**
 * Toolbar - Persistent control bar for the Quantum Garden.
 *
 * Provides visible buttons for:
 * - Debug panel toggle (hidden in production)
 * - Help/info toggle
 * - Sound toggle
 * - Status indicator showing garden activity
 */

interface ToolbarProps {
  isDebugOpen: boolean;
  onDebugToggle: () => void;
  onShowHelp: () => void;
}

export function Toolbar({ isDebugOpen, onDebugToggle, onShowHelp }: ToolbarProps) {
  const { plants } = useGardenStore();
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

  return (
    <div className="fixed top-[var(--inset-top)] left-[var(--inset-left)] right-4 sm:right-auto z-50 flex flex-col gap-2">
      {/* Main Toolbar */}
      <div className="flex flex-wrap items-center gap-2 garden-panel rounded-xl p-2 max-w-full overflow-hidden">
        {/* Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[--wc-paper]/60 rounded">
          <span
            className={`w-2 h-2 rounded-full ${plantCount === 0 ? "bg-yellow-500 animate-pulse" : "bg-green-500 animate-organic-pulse"}`}
          />
          <span className="text-xs text-[--wc-ink-muted]">
            {plantCount === 0 ? "Loading..." : `${plantCount} plants`}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-[--wc-stone]/30" />

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
      <div className="hidden sm:flex items-center gap-3 garden-panel rounded-xl px-3 py-2 text-xs">
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
        <div className="garden-panel rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200 max-w-xs">
          <h3 className="text-[--wc-ink] text-sm font-medium mb-3">Keyboard Shortcuts</h3>

          {/* General shortcuts */}
          <div className="space-y-2">
            <ShortcutRow shortcut="?" description="Show help" />
            <ShortcutRow shortcut="`" description="Toggle debug panel" />
            <ShortcutRow shortcut="Esc" description="Close panels" />
          </div>

          {/* Event log navigation */}
          <div className="mt-4 pt-3 border-t border-[--wc-stone]/30">
            <h4 className="text-[--wc-ink-muted] text-xs uppercase tracking-wide mb-2">
              Event Navigation
            </h4>
            <div className="space-y-2">
              <ShortcutRow shortcut="←" description="Previous event" />
              <ShortcutRow shortcut="→" description="Next event" />
            </div>
          </div>

          {/* Interaction hint */}
          <div className="mt-4 pt-3 border-t border-[--wc-stone]/30">
            <h4 className="text-[--wc-ink-muted] text-xs uppercase tracking-wide mb-2">
              Observation
            </h4>
            <p className="text-[--wc-ink-muted] text-xs leading-relaxed">
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
    green: "bg-emerald-50/60 text-emerald-800 border-emerald-300/40",
    purple: "bg-purple-50/60 text-purple-800 border-purple-300/40",
    blue: "bg-blue-50/60 text-blue-800 border-blue-300/40",
    cyan: "bg-cyan-50/60 text-cyan-800 border-cyan-300/40",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded border transition-all
        ${
          disabled
            ? "opacity-40 cursor-not-allowed bg-[--wc-paper]/40 border-[--wc-stone]/10 text-[--wc-ink-muted]"
            : active
              ? activeClasses[activeColor]
              : "bg-[--wc-paper]/40 border-[--wc-stone]/20 text-[--wc-ink-soft] hover:bg-[--wc-paper]/70 hover:text-[--wc-ink]"
        }
      `}
      title={shortcut ? `${label} (${shortcut})` : label}
    >
      {icon}
      <span className="hidden min-[400px]:inline text-xs font-medium">{label}</span>
      {shortcut && (
        <kbd className="hidden sm:inline-block ml-1 px-1 py-0.5 text-[10px] bg-black/8 rounded text-[--wc-bark]">
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
    gray: "text-[--wc-ink-muted]",
    green: "text-emerald-700",
    cyan: "text-cyan-700",
    purple: "text-purple-700",
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className={colorClasses[color]}>{icon}</span>
      <span className="text-[--wc-ink-muted]">{label}:</span>
      <span className={`font-mono ${colorClasses[color]}`}>{value}</span>
    </div>
  );
}

// Shortcut Row Component
function ShortcutRow({ shortcut, description }: { shortcut: string; description: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[--wc-ink-soft] text-xs">{description}</span>
      <kbd className="px-2 py-1 bg-[--wc-paper] rounded text-[--wc-ink-soft] text-xs font-mono border border-[--wc-stone]/40">
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
