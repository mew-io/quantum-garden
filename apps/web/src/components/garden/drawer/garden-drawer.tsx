"use client";

import { useState, useEffect, useCallback } from "react";
import { DrawerHandle } from "./drawer-handle";
import { InfoTab } from "./info-tab";
import { EventsTab } from "./events-tab";
import { GardenTab } from "./garden-tab";
import { DebugTab } from "./debug-tab";
import { debugLogger } from "@/lib/debug-logger";

type TabId = "info" | "events" | "garden" | "debug";

const TABS: { id: TabId; label: string }[] = [
  { id: "info", label: "Info" },
  { id: "events", label: "Events" },
  { id: "garden", label: "Garden" },
  { id: "debug", label: "Debug" },
];

export function GardenDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("info");
  const [focusedPlantId, setFocusedPlantId] = useState<string | null>(null);

  const toggleDrawer = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Dispatch debug visibility event when debug tab becomes active/inactive
  useEffect(() => {
    const isDebugVisible = isOpen && activeTab === "debug";
    window.dispatchEvent(
      new CustomEvent("debug-visibility-change", {
        detail: { visible: isDebugVisible },
      })
    );
    if (isDebugVisible) {
      debugLogger.system.info("Debug panel opened");
    }
  }, [isOpen, activeTab]);

  // Open drawer to debug tab when a plant is clicked on canvas
  // Handles both open-plant-detail and plant-debug-select in one listener
  // to avoid race conditions (DebugTab may not be mounted yet)
  useEffect(() => {
    const handleOpenPlantDetail = (e: CustomEvent<{ plantId: string }>) => {
      setFocusedPlantId(e.detail.plantId);
      setIsOpen(true);
      setActiveTab("debug");
    };

    window.addEventListener(
      "open-plant-detail" as keyof WindowEventMap,
      handleOpenPlantDetail as EventListener
    );
    return () =>
      window.removeEventListener(
        "open-plant-detail" as keyof WindowEventMap,
        handleOpenPlantDetail as EventListener
      );
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Backtick — toggle debug tab
      if (e.key === "`" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (isOpen && activeTab === "debug") {
          setIsOpen(false);
        } else {
          setIsOpen(true);
          setActiveTab("debug");
        }
      }

      // Escape — close drawer
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeTab]);

  return (
    <div className="fixed bottom-[var(--inset-bottom)] right-[var(--inset-right)] z-50 flex flex-col items-end gap-2 w-full sm:w-auto pointer-events-none">
      {/* Drawer Panel */}
      <div
        className={`
          pointer-events-auto w-full sm:w-[380px] garden-panel rounded-xl
          flex flex-col overflow-hidden
          transition-all duration-300 ease-out origin-bottom
          ${
            isOpen
              ? "max-h-[70vh] opacity-100 translate-y-0"
              : "max-h-0 opacity-0 translate-y-4 pointer-events-none"
          }
        `}
        aria-hidden={!isOpen}
      >
        {/* Tab bar */}
        <div className="flex border-b border-[--wc-stone]/20 flex-shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 px-3 py-2.5 text-xs font-medium transition-colors
                ${
                  activeTab === tab.id
                    ? "text-[--wc-ink] border-b-2 border-[--wc-bark]"
                    : "text-[--wc-ink-muted] hover:text-[--wc-ink-soft]"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div
          className="flex-1 min-h-0 overflow-hidden flex flex-col"
          style={{ height: isOpen ? "min(calc(70vh - 44px), 500px)" : 0 }}
        >
          {activeTab === "info" && <InfoTab />}
          {activeTab === "events" && <EventsTab />}
          {activeTab === "garden" && <GardenTab />}
          {activeTab === "debug" && (
            <DebugTab
              isActive={isOpen && activeTab === "debug"}
              focusedPlantId={focusedPlantId}
              onFocusedPlantHandled={() => setFocusedPlantId(null)}
            />
          )}
        </div>
      </div>

      {/* Handle — always visible */}
      <div className="pointer-events-auto ml-auto">
        <DrawerHandle isOpen={isOpen} onClick={toggleDrawer} />
      </div>
    </div>
  );
}
