"use client";

import { useMemo } from "react";
import { useGardenStore } from "@/stores/garden-store";
import { useAudio } from "@/lib/audio";
import { SpeakerOnIcon, SpeakerOffIcon, ChevronUpIcon } from "@/components/garden/icons";

interface DrawerHandleProps {
  isOpen: boolean;
  onClick: () => void;
}

export function DrawerHandle({ isOpen, onClick }: DrawerHandleProps) {
  const { plants } = useGardenStore();
  const { isEnabled: isSoundEnabled, toggleEnabled: toggleSound, init: initAudio } = useAudio();

  const plantCount = useMemo(() => plants.length, [plants]);

  const handleSoundClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    initAudio();
    toggleSound();
  };

  return (
    <button
      onClick={onClick}
      className="
        flex items-center gap-3 garden-panel rounded-xl px-4 py-2.5
        cursor-pointer transition-all duration-200
        hover:shadow-md active:scale-[0.98]
        min-h-[44px]
      "
      aria-label={isOpen ? "Close drawer" : "Open drawer"}
      aria-expanded={isOpen}
    >
      {/* Status dot + plant count */}
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            plantCount === 0 ? "bg-yellow-500 animate-pulse" : "bg-green-500 animate-organic-pulse"
          }`}
        />
        <span className="text-xs text-[--wc-ink-muted]">
          {plantCount === 0 ? "Loading..." : `${plantCount} plants`}
        </span>
      </div>

      {/* Sound toggle */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleSoundClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleSoundClick(e as unknown as React.MouseEvent);
          }
        }}
        className={`
          p-1 rounded transition-colors
          ${isSoundEnabled ? "text-cyan-700" : "text-[--wc-ink-muted]"}
          hover:bg-black/5
        `}
        aria-label={isSoundEnabled ? "Mute sound" : "Enable sound"}
      >
        {isSoundEnabled ? <SpeakerOnIcon size={14} /> : <SpeakerOffIcon size={14} />}
      </div>

      {/* Chevron */}
      <div
        className={`text-[--wc-ink-muted] transition-transform duration-300 ${
          isOpen ? "rotate-180" : ""
        }`}
      >
        <ChevronUpIcon size={14} />
      </div>
    </button>
  );
}
