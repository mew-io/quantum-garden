"use client";

import { useState } from "react";
import { useGardenStore } from "@/stores/garden-store";
import { trpc } from "@/lib/trpc/client";

/**
 * Toolbar - Persistent control bar for the Quantum Garden.
 *
 * Provides visible buttons for:
 * - Debug panel toggle
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

  // Fetch plant data for status
  const { data: plantsData, isLoading } = trpc.plants.list.useQuery(undefined, {
    refetchInterval: 5000,
  });

  const plantCount = plantsData?.length ?? plants.length ?? 0;
  const germinatedCount = plantsData?.filter((p) => p.germinatedAt !== null).length ?? 0;
  const observedCount = plantsData?.filter((p) => p.observed).length ?? 0;

  // Toggle time travel
  const handleTimeTravelToggle = () => {
    if (isTimeTravelAvailable) {
      setTimeTravelMode(!isTimeTravelMode);
    }
  };

  return (
    <div className="fixed top-4 left-4 z-50 flex flex-col gap-2">
      {/* Main Toolbar */}
      <div className="flex items-center gap-2 bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700/50 p-2 shadow-xl">
        {/* Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded">
          <span
            className={`w-2 h-2 rounded-full ${isLoading ? "bg-yellow-500 animate-pulse" : "bg-green-500 animate-pulse"}`}
          />
          <span className="text-xs text-gray-400">
            {isLoading ? "Loading..." : `${plantCount} plants`}
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

        {/* Debug Button */}
        <ToolbarButton
          icon={<BugIcon />}
          label="Debug"
          shortcut="`"
          onClick={onDebugToggle}
          active={isDebugOpen}
          activeColor="green"
        />

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
      <div className="flex items-center gap-3 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-700/50 px-3 py-2 shadow-lg text-xs">
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
        <div className="bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <h3 className="text-gray-200 text-sm font-medium mb-3">Keyboard Shortcuts</h3>
          <div className="space-y-2">
            <ShortcutRow shortcut="`" description="Toggle debug panel" />
            <ShortcutRow shortcut="T" description="Toggle time-travel" />
            <ShortcutRow shortcut="?" description="Show help" />
            <ShortcutRow shortcut="Esc" description="Close panels" />
          </div>
          <div className="mt-4 pt-3 border-t border-gray-700/50">
            <h4 className="text-gray-400 text-xs uppercase tracking-wide mb-2">Interaction</h4>
            <p className="text-gray-500 text-xs">
              Move your cursor over plants to observe them. Observed plants reveal their quantum
              traits.
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
      <span className="text-xs font-medium">{label}</span>
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
