"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { trpc } from "@/lib/trpc/client";
import { useGardenStore } from "@/stores/garden-store";
import { useDebugLogs, filterLogs, debugLogger } from "@/lib/debug-logger";
import type { LogCategory, LogLevel } from "@/lib/debug-logger";
import type { Plant, QuantumPropertySchema, CircuitType } from "@quantum-garden/shared";
import { getVariantById } from "@quantum-garden/shared";
import { getCircuitInfo } from "@/lib/quantum-explanations";

interface DebugTabProps {
  isActive: boolean;
}

export function DebugTab({ isActive }: DebugTabProps) {
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [detailPlantId, setDetailPlantId] = useState<string | null>(null);
  const [superpositionMode, setSuperpositionMode] = useState<0 | 1>(0);
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "logs" | "plants">("overview");
  const [logFilters, setLogFilters] = useState<{
    categories: LogCategory[];
    levels: LogLevel[];
  }>({
    categories: ["quantum", "observation", "evolution", "rendering", "system"],
    levels: ["debug", "info", "warn", "error"],
  });

  const { performanceStats } = useGardenStore();

  const allLogs = useDebugLogs();
  const filteredLogs = filterLogs(allLogs, logFilters);

  const { data: plants } = trpc.plants.list.useQuery(undefined, {
    enabled: isActive,
    refetchInterval: isActive ? 2000 : false,
  });

  const { data: quantumConfig } = trpc.quantum.getConfig.useQuery(undefined, {
    enabled: isActive,
    refetchInterval: isActive ? 5000 : false,
  });

  const { data: jobStats } = trpc.quantum.getJobStats.useQuery(undefined, {
    enabled: isActive,
    refetchInterval: isActive ? 2000 : false,
  });

  // Listen for plant selection events from the canvas
  useEffect(() => {
    const handlePlantSelect = (e: CustomEvent<{ plantId: string }>) => {
      setSelectedPlantId(e.detail.plantId);
      setDetailPlantId(e.detail.plantId);
      setActiveSubTab("plants");
    };

    window.addEventListener(
      "plant-debug-select" as keyof WindowEventMap,
      handlePlantSelect as EventListener
    );
    return () =>
      window.removeEventListener(
        "plant-debug-select" as keyof WindowEventMap,
        handlePlantSelect as EventListener
      );
  }, []);

  const toggleSuperpositionMode = useCallback(() => {
    const newMode = superpositionMode === 0 ? 1 : 0;
    setSuperpositionMode(newMode);
    debugLogger.rendering.info(
      `Superposition mode changed to ${newMode === 0 ? "stacked ghosts" : "flickering"}`
    );
    window.dispatchEvent(
      new CustomEvent("superposition-mode-change", {
        detail: { mode: newMode },
      })
    );
  }, [superpositionMode]);

  const toggleCategory = (category: LogCategory) => {
    setLogFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const toggleLevel = (level: LogLevel) => {
    setLogFilters((prev) => ({
      ...prev,
      levels: prev.levels.includes(level)
        ? prev.levels.filter((l) => l !== level)
        : [...prev.levels, level],
    }));
  };

  const observedCount = plants?.filter((p: Plant) => p.observed).length ?? 0;
  const germinatedCount = plants?.filter((p: Plant) => p.germinatedAt !== null).length ?? 0;
  const dormantCount = plants?.filter((p: Plant) => p.germinatedAt === null).length ?? 0;
  const totalCount = plants?.length ?? 0;
  return (
    <div className="flex flex-col h-full min-h-0 relative">
      {/* Sub-tab Navigation */}
      <div className="flex border-b border-[--wc-stone]/20 bg-[--wc-paper]/60 flex-shrink-0">
        {(["overview", "logs", "plants"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
              activeSubTab === tab
                ? "text-emerald-700 border-b-2 border-emerald-600"
                : "text-[--wc-ink-muted] hover:text-[--wc-ink-soft]"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === "logs" && filteredLogs.length > 0 && (
              <span className="ml-1 text-[--wc-ink-muted]">({filteredLogs.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Sub-tab Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {activeSubTab === "overview" && (
          <>
            {performanceStats && (
              <section>
                <h4 className="text-[--wc-ink-muted] text-xs uppercase tracking-wide mb-2">
                  Performance
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  <Stat
                    label="FPS"
                    value={performanceStats.fps.toFixed(0)}
                    color={
                      performanceStats.fps >= 55
                        ? "green"
                        : performanceStats.fps >= 30
                          ? "yellow"
                          : "red"
                    }
                  />
                  <Stat
                    label="Frame"
                    value={`${performanceStats.frameTimeMs.toFixed(1)}ms`}
                    color={
                      performanceStats.frameTimeMs <= 18
                        ? "green"
                        : performanceStats.frameTimeMs <= 33
                          ? "yellow"
                          : "red"
                    }
                  />
                  <Stat label="Draws" value={performanceStats.drawCalls} color="cyan" />
                  <Stat label="Tris" value={performanceStats.triangles} color="purple" />
                </div>
              </section>
            )}

            <section>
              <h4 className="text-[--wc-ink-muted] text-xs uppercase tracking-wide mb-2">
                Garden Stats
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <Stat label="Total" value={totalCount} />
                <Stat label="Germinated" value={germinatedCount} color="green" />
                <Stat label="Dormant" value={dormantCount} color="yellow" />
                <Stat label="Observed" value={observedCount} color="cyan" />
                <Stat label="Superposed" value={totalCount - observedCount} color="purple" />
              </div>
            </section>

            {quantumConfig && (
              <section>
                <h4 className="text-[--wc-ink-muted] text-xs uppercase tracking-wide mb-2">
                  Quantum Service
                </h4>
                <div className="bg-[--wc-paper]/60 rounded p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[--wc-ink-muted] text-xs">Execution Mode</span>
                    <span
                      className={`text-xs font-mono px-2 py-1 rounded ${
                        quantumConfig.execution_mode === "simulator"
                          ? "bg-blue-50/60 text-blue-700"
                          : quantumConfig.execution_mode === "hardware"
                            ? "bg-purple-50/60 text-purple-700"
                            : "bg-black/5 text-[--wc-ink-muted]"
                      }`}
                    >
                      {quantumConfig.execution_mode.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[--wc-ink-muted]">IonQ API Key</span>
                    <span
                      className={
                        quantumConfig.ionq_api_key_configured
                          ? "text-emerald-700"
                          : "text-[--wc-ink-muted]"
                      }
                    >
                      {quantumConfig.ionq_api_key_configured ? "Configured" : "Not Set"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[--wc-ink-muted]">Default Shots</span>
                    <span className="text-cyan-700">{quantumConfig.default_shots}</span>
                  </div>
                </div>
              </section>
            )}

            {jobStats && (
              <section>
                <h4 className="text-[--wc-ink-muted] text-xs uppercase tracking-wide mb-2">
                  Quantum Jobs
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <Stat label="Pending" value={jobStats.pending} />
                  <Stat label="Completed" value={jobStats.completed} color="green" />
                  <Stat label="Failed" value={jobStats.failed} color="red" />
                  <Stat label="Total" value={jobStats.total} />
                </div>
              </section>
            )}

            <section>
              <h4 className="text-[--wc-ink-muted] text-xs uppercase tracking-wide mb-2">
                Controls
              </h4>
              <div className="space-y-2">
                <button
                  onClick={toggleSuperpositionMode}
                  className="w-full py-2 px-3 bg-[--wc-paper]/60 hover:bg-[--wc-paper] text-[--wc-ink-soft] rounded flex items-center justify-between"
                >
                  <span className="text-xs">Superposition Display</span>
                  <span
                    className={`text-xs font-mono px-2 py-1 rounded ${
                      superpositionMode === 0
                        ? "bg-purple-50/60 text-purple-700"
                        : "bg-cyan-50/60 text-cyan-700"
                    }`}
                  >
                    {superpositionMode === 0 ? "GHOSTS" : "FLICKER"}
                  </span>
                </button>
              </div>
            </section>
          </>
        )}

        {activeSubTab === "logs" && (
          <>
            <section>
              <h4 className="text-[--wc-ink-muted] text-xs uppercase tracking-wide mb-2">
                Filters
              </h4>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {(
                    ["quantum", "observation", "evolution", "rendering", "system"] as LogCategory[]
                  ).map((cat) => (
                    <DebugFilterChip
                      key={cat}
                      label={cat}
                      active={logFilters.categories.includes(cat)}
                      onClick={() => toggleCategory(cat)}
                      color={getCategoryColor(cat)}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {(["debug", "info", "warn", "error"] as LogLevel[]).map((level) => (
                    <DebugFilterChip
                      key={level}
                      label={level}
                      active={logFilters.levels.includes(level)}
                      onClick={() => toggleLevel(level)}
                      color={getLevelColor(level)}
                    />
                  ))}
                </div>
              </div>
            </section>

            <section>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-[--wc-ink-muted] text-xs uppercase tracking-wide">
                  Messages ({filteredLogs.length})
                </h4>
                <button
                  onClick={() => debugLogger.clear()}
                  className="text-xs text-[--wc-ink-muted] hover:text-[--wc-ink-soft]"
                >
                  Clear
                </button>
              </div>
              <div className="bg-[--wc-paper]/60 rounded max-h-96 overflow-auto">
                {filteredLogs.length === 0 ? (
                  <div className="p-4 text-center text-[--wc-ink-muted] text-xs">
                    No log messages
                  </div>
                ) : (
                  <div className="divide-y divide-[--wc-stone]/20">
                    {[...filteredLogs].reverse().map((log) => (
                      <LogEntryRow key={log.id} log={log} />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {activeSubTab === "plants" && (
          <>
            {detailPlantId ? (
              <PlantDetailView
                plantId={detailPlantId}
                isActive={isActive}
                onBack={() => setDetailPlantId(null)}
              />
            ) : (
              <section>
                <h4 className="text-[--wc-ink-muted] text-xs uppercase tracking-wide mb-2">
                  All Plants ({totalCount})
                </h4>
                <div className="space-y-1">
                  {plants?.map((plant: Plant) => (
                    <button
                      key={plant.id}
                      onClick={() => {
                        setSelectedPlantId(plant.id);
                        setDetailPlantId(plant.id);
                        window.dispatchEvent(
                          new CustomEvent("plant-debug-highlight", {
                            detail: { plantId: plant.id },
                          })
                        );
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded text-xs flex justify-between items-center ${
                        plant.id === selectedPlantId
                          ? "bg-blue-50/60 text-blue-700"
                          : "hover:bg-[--wc-paper]/60 text-[--wc-ink-muted]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            plant.observed
                              ? "bg-yellow-400"
                              : plant.germinatedAt
                                ? "bg-green-500"
                                : "bg-[--wc-stone]/40"
                          }`}
                        />
                        <span>{plant.variantId}</span>
                      </div>
                      <span className="text-[--wc-ink-muted]/60 font-mono">
                        {plant.id.slice(-6)}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Plant Detail View
// ============================================================================

function PlantDetailView({
  plantId,
  isActive,
  onBack,
}: {
  plantId: string;
  isActive: boolean;
  onBack: () => void;
}) {
  const [showCircuitDef, setShowCircuitDef] = useState(false);

  const { data, isLoading } = trpc.plants.getDebugDetail.useQuery(
    { id: plantId },
    { enabled: isActive, refetchInterval: isActive ? 3000 : false }
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="text-xs text-[--wc-ink-muted] hover:text-[--wc-ink-soft]"
        >
          &larr; All Plants
        </button>
        <div className="text-center text-[--wc-ink-muted] text-xs py-8">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="text-xs text-[--wc-ink-muted] hover:text-[--wc-ink-soft]"
        >
          &larr; All Plants
        </button>
        <div className="text-center text-[--wc-ink-muted] text-xs py-8">Plant not found</div>
      </div>
    );
  }

  const { plant, quantumRecord, entangledPlants } = data;
  const variant = getVariantById(plant.variantId);
  const traits = plant.traits;
  const signals = traits?.quantumSignals;

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-xs text-[--wc-ink-muted] hover:text-[--wc-ink-soft]"
        >
          &larr; All Plants
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent("plant-debug-locate", {
                  detail: { plantId: plant.id, position: plant.position },
                })
              );
            }}
            className="text-[10px] px-1.5 py-0.5 rounded border border-[--wc-ink-muted]/20 text-[--wc-ink-muted] hover:text-[--wc-ink-soft] hover:border-[--wc-ink-muted]/40 transition-colors"
          >
            Locate
          </button>
          <span className="text-[--wc-ink-muted]/60 font-mono text-xs">{plant.id.slice(-8)}</span>
        </div>
      </div>

      {/* Plant Info */}
      <section>
        <h4 className="text-[--wc-ink-muted] text-xs uppercase tracking-wide mb-2">Plant Info</h4>
        <div className="bg-[--wc-paper]/60 rounded p-3 space-y-1.5 text-xs">
          <DetailRow
            label="Variant"
            value={variant?.name ?? plant.variantId}
            color="text-emerald-700"
          />
          <DetailRow label="Variant ID" value={plant.variantId} mono />
          {variant && <DetailRow label="Rarity" value={variant.rarity.toFixed(2)} />}
          <DetailRow
            label="Position"
            value={`(${plant.position.x.toFixed(0)}, ${plant.position.y.toFixed(0)})`}
            color="text-cyan-700"
            mono
          />
          <DetailRow
            label="State"
            value={plant.visualState}
            color={plant.observed ? "text-yellow-700" : "text-blue-700"}
          />
          <DetailRow
            label="Observed"
            value={plant.observedAt ? formatTime(plant.observedAt) : "No"}
            color={plant.observed ? "text-yellow-700" : "text-[--wc-ink-muted]"}
          />
          <DetailRow
            label="Germinated"
            value={plant.germinatedAt ? formatTime(plant.germinatedAt) : "No (dormant)"}
            color={plant.germinatedAt ? "text-emerald-700" : "text-[--wc-ink-muted]"}
          />
          <DetailRow label="Lifecycle Mod" value={`${plant.lifecycleModifier.toFixed(2)}x`} />
          {plant.colorVariationName && (
            <DetailRow label="Color Variation" value={plant.colorVariationName} />
          )}
          {plant.entanglementGroupId && (
            <>
              <DetailRow label="Entangled" value="Yes" color="text-purple-700" />
              {entangledPlants.length > 0 && (
                <div className="pl-2 space-y-0.5">
                  {entangledPlants.map((ep) => (
                    <div key={ep.id} className="text-[--wc-ink-muted] font-mono text-[10px]">
                      {ep.variantId} ({ep.id.slice(-6)})
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Quantum Circuit */}
      {quantumRecord && (
        <CircuitSection
          quantumRecord={quantumRecord}
          showCircuitDef={showCircuitDef}
          onToggleCircuitDef={() => setShowCircuitDef(!showCircuitDef)}
        />
      )}

      {/* Measurement Data — signals, probabilities, trait mapping, resolved traits */}
      <section>
        <h4 className="text-[--wc-ink-muted] text-xs uppercase tracking-wide mb-2">
          Measurement Data
        </h4>
        {signals ? (
          <div className="space-y-4">
            {/* Execution mode indicator for mock traits */}
            {!quantumRecord?.probabilities?.length && plant.observed && (
              <div className="bg-amber-50/60 border border-amber-200/40 rounded p-2 text-[10px] text-amber-800 leading-relaxed">
                Mock signals — quantum pool was unavailable at observation time. Traits are seeded
                from the circuit definition.
              </div>
            )}

            {/* Quantum Signals */}
            <div className="bg-[--wc-paper]/60 rounded p-3 space-y-2">
              <p className="text-[10px] text-[--wc-ink-muted] leading-relaxed mb-1">
                Statistical properties derived from the probability distribution. These drive visual
                traits.
              </p>
              <SignalBar
                label="Entropy"
                value={signals.entropy}
                color="bg-purple-500"
                description="Outcome uncertainty"
              />
              <SignalBar
                label="Dominance"
                value={signals.dominance}
                color="bg-cyan-500"
                description="Strongest outcome"
              />
              <SignalBar
                label="Spread"
                value={signals.spread}
                color="bg-blue-500"
                description="Outcome diversity"
              />
              <SignalBar
                label="Parity Bias"
                value={signals.parityBias}
                color="bg-amber-500"
                description="Even/odd balance"
              />
              <SignalBar
                label="Growth"
                value={signals.growth}
                color="bg-emerald-500"
                description="Lifecycle speed"
              />
              <SignalBar
                label="Certainty"
                value={signals.certainty}
                color="bg-yellow-500"
                description="Visual opacity"
              />
            </div>

            {/* Probability Distribution */}
            {quantumRecord && quantumRecord.probabilities.length > 0 && (
              <div className="bg-[--wc-paper]/60 rounded p-3 space-y-1.5">
                <p className="text-[10px] text-[--wc-ink-muted] mb-1">
                  Raw probability per measurement outcome
                </p>
                {quantumRecord.probabilities.map((prob, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px]">
                    <span className="text-[--wc-ink-muted] font-mono w-6 text-right">{i}</span>
                    <div className="flex-1 h-1.5 bg-black/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-400/70 rounded-full"
                        style={{ width: `${prob * 100}%` }}
                      />
                    </div>
                    <span className="text-[--wc-ink-muted] font-mono w-10 text-right">
                      {prob.toFixed(3)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Trait Mapping (Path B) */}
            {variant?.quantumMapping?.schema && (
              <div className="bg-[--wc-paper]/60 rounded p-3 space-y-2 text-xs">
                <p className="text-[10px] text-[--wc-ink-muted] mb-1">
                  How signals map to this variant&apos;s visual properties
                </p>
                {Object.entries(variant.quantumMapping.schema as QuantumPropertySchema).map(
                  ([propName, mapping]) => {
                    const signalValue = signals[mapping.signal];
                    const resolvedValue = traits?.[propName];
                    return (
                      <div key={propName} className="space-y-0.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[--wc-ink-soft] font-medium">{propName}</span>
                          <span className="text-cyan-700 font-mono">
                            {resolvedValue != null
                              ? typeof resolvedValue === "number"
                                ? resolvedValue.toFixed(2)
                                : String(resolvedValue)
                              : "—"}
                          </span>
                        </div>
                        <div className="text-[10px] text-[--wc-ink-muted] flex gap-2">
                          <span>
                            {mapping.signal}: {signalValue.toFixed(2)}
                          </span>
                          <span>
                            &rarr; [{mapping.range[0]}, {mapping.range[1]}]
                          </span>
                          {mapping.curve && mapping.curve !== "linear" && (
                            <span>({mapping.curve})</span>
                          )}
                          {mapping.round && <span>(round)</span>}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}

            {variant && !variant.quantumMapping?.schema && variant.circuitId && (
              <div className="bg-[--wc-paper]/60 rounded p-3 text-xs text-[--wc-ink-muted]">
                Path A — traits set by Python circuit ({variant.circuitId})
              </div>
            )}

            {/* Resolved Traits */}
            {traits && (
              <div className="bg-[--wc-paper]/60 rounded p-3 space-y-1.5 text-xs">
                <p className="text-[10px] text-[--wc-ink-muted] mb-1">
                  Final trait values stored on this plant
                </p>
                {traits.colorPalette && (
                  <div className="flex justify-between items-center">
                    <span className="text-[--wc-ink-muted]">Color Palette</span>
                    <div className="flex gap-0.5">
                      {traits.colorPalette.map((color, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded border border-[--wc-stone]/20"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <DetailRow
                  label="Growth Rate"
                  value={traits.growthRate?.toFixed(3) ?? "—"}
                  color="text-cyan-700"
                />
                <DetailRow
                  label="Opacity"
                  value={traits.opacity?.toFixed(3) ?? "—"}
                  color="text-cyan-700"
                />
                {Object.entries(traits)
                  .filter(
                    ([key]) =>
                      ![
                        "glyphPattern",
                        "colorPalette",
                        "growthRate",
                        "opacity",
                        "quantumSignals",
                      ].includes(key)
                  )
                  .map(([key, value]) => (
                    <DetailRow
                      key={key}
                      label={key}
                      value={
                        typeof value === "number"
                          ? value.toFixed(3)
                          : typeof value === "string"
                            ? value
                            : JSON.stringify(value)
                      }
                    />
                  ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[--wc-paper]/60 rounded p-3 text-xs text-[--wc-ink-muted] space-y-2">
            {plant.observed ? (
              <>
                <p>
                  This plant was observed but has no quantum signals — it was likely observed when
                  the quantum pool was unavailable and before mock signal generation was added.
                </p>
                <p className="text-[10px] leading-relaxed">
                  Visual traits were set from fallback values. Re-observation is not possible, but
                  the plant renders normally with its stored traits.
                </p>
              </>
            ) : (
              <>
                <p>
                  This plant is still in superposition — its quantum state hasn&apos;t been measured
                  yet.
                </p>
                <p className="text-[10px] leading-relaxed">
                  When observed, the wave function collapses and measurement outcomes are recorded.
                  From those outcomes, six quantum signals are computed (entropy, dominance, spread,
                  parity bias, growth, certainty) which then drive this plant&apos;s visual traits.
                </p>
                {variant?.quantumMapping?.schema && (
                  <div className="border-t border-[--wc-stone]/15 pt-2 mt-2 space-y-1">
                    <p className="text-[10px] text-[--wc-ink-muted]">
                      Pending trait mappings for this variant:
                    </p>
                    {Object.entries(variant.quantumMapping.schema as QuantumPropertySchema).map(
                      ([propName, mapping]) => (
                        <div key={propName} className="text-[10px] flex justify-between">
                          <span>{propName}</span>
                          <span className="text-[--wc-ink-muted]/60">
                            {mapping.signal} &rarr; [{mapping.range[0]}, {mapping.range[1]}]
                            {mapping.round ? " (round)" : ""}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function CircuitSection({
  quantumRecord,
  showCircuitDef,
  onToggleCircuitDef,
}: {
  quantumRecord: {
    circuitId: string;
    circuitDefinition: unknown;
    status: string;
    ionqJobId: string | null;
    measurements: number[];
    probabilities: number[];
    createdAt: Date | string;
    completedAt: Date | string | null;
  };
  showCircuitDef: boolean;
  onToggleCircuitDef: () => void;
}) {
  const circuitInfo = getCircuitInfo(quantumRecord.circuitId as CircuitType);

  return (
    <section>
      <h4 className="text-[--wc-ink-muted] text-xs uppercase tracking-wide mb-2">
        Quantum Circuit
      </h4>
      <div className="bg-[--wc-paper]/60 rounded p-3 space-y-3 text-xs">
        {/* Circuit identity */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-purple-700 font-medium">{circuitInfo.name}</span>
            <span className="text-[--wc-ink-muted] font-mono text-[10px]">
              Level {circuitInfo.level} &middot; {circuitInfo.qubits} qubit
              {circuitInfo.qubits > 1 ? "s" : ""}
            </span>
          </div>
          <p className="text-[--wc-ink-muted] text-[11px] leading-relaxed">{circuitInfo.concept}</p>
        </div>

        {/* Circuit diagram */}
        <pre className="p-2 bg-[--wc-paper]/80 rounded text-[10px] text-purple-700/80 font-mono leading-tight overflow-x-auto">
          {circuitInfo.diagram.join("\n")}
        </pre>

        {/* Gate description */}
        <p className="text-[10px] text-[--wc-ink-muted] leading-relaxed">
          {circuitInfo.gateDescription}
        </p>

        {/* Status & metadata */}
        <div className="border-t border-[--wc-stone]/15 pt-2 space-y-1.5">
          <DetailRow
            label="Status"
            value={quantumRecord.status}
            color={
              quantumRecord.status === "completed"
                ? "text-emerald-700"
                : quantumRecord.status === "failed"
                  ? "text-red-700"
                  : "text-yellow-700"
            }
          />
          {quantumRecord.ionqJobId && (
            <DetailRow label="IonQ Job" value={quantumRecord.ionqJobId} mono />
          )}
          {quantumRecord.completedAt && (
            <DetailRow label="Completed" value={formatTime(quantumRecord.completedAt)} />
          )}
        </div>

        {/* Raw circuit definition (collapsible) */}
        <button
          onClick={onToggleCircuitDef}
          className="text-[--wc-ink-muted] hover:text-[--wc-ink-soft] text-[10px] underline"
        >
          {showCircuitDef ? "Hide" : "Show"} raw circuit data
        </button>
        {showCircuitDef && (
          <pre className="p-2 bg-[--wc-paper]/80 rounded text-[10px] text-[--wc-ink-soft] overflow-x-auto max-h-32 overflow-y-auto">
            {JSON.stringify(quantumRecord.circuitDefinition, null, 2)}
          </pre>
        )}
      </div>
    </section>
  );
}

function DetailRow({
  label,
  value,
  color,
  mono,
}: {
  label: string;
  value: string;
  color?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between items-baseline gap-2 text-xs">
      <span className="text-[--wc-ink-muted] shrink-0">{label}</span>
      <span
        className={`${color ?? "text-[--wc-ink-soft]"} ${mono ? "font-mono" : ""} text-right truncate`}
      >
        {value}
      </span>
    </div>
  );
}

function SignalBar({
  label,
  value,
  color,
  description,
}: {
  label: string;
  value: number;
  color: string;
  description?: string;
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[10px]">
        <span className="text-[--wc-ink-muted]">
          {label}
          {description && <span className="text-[--wc-ink-muted]/50 ml-1">({description})</span>}
        </span>
        <span className="text-[--wc-ink-soft] font-mono">{value.toFixed(3)}</span>
      </div>
      <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-300`}
          style={{ width: `${value * 100}%`, opacity: 0.7 }}
        />
      </div>
    </div>
  );
}

function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// ============================================================================
// Helper components
// ============================================================================

function Stat({
  label,
  value,
  color = "white",
}: {
  label: string;
  value: string | number;
  color?: "white" | "red" | "green" | "yellow" | "cyan" | "purple";
}) {
  const prevValueRef = useRef<string | number>(value);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    if (prevValueRef.current !== value) {
      prevValueRef.current = value;
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [value]);

  const colorClass = {
    white: "text-[--wc-ink]",
    red: "text-red-700",
    green: "text-emerald-700",
    yellow: "text-yellow-700",
    cyan: "text-cyan-700",
    purple: "text-purple-700",
  }[color];

  const flashClass = isFlashing
    ? color === "green"
      ? "bg-emerald-100/40"
      : color === "red"
        ? "bg-red-100/40"
        : color === "yellow"
          ? "bg-yellow-100/40"
          : color === "cyan"
            ? "bg-cyan-100/40"
            : color === "purple"
              ? "bg-purple-100/40"
              : "bg-black/5"
    : "";

  return (
    <div
      className={`bg-[--wc-paper]/60 rounded px-3 py-2 transition-colors duration-300 ${flashClass}`}
    >
      <div className="text-[--wc-ink-muted] text-xs">{label}</div>
      <div className={`font-mono transition-opacity duration-150 ${colorClass}`}>{value}</div>
    </div>
  );
}

function DebugFilterChip({
  label,
  active,
  onClick,
  color,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-2 py-1 rounded border transition-colors ${
        active
          ? `${color} border-current`
          : "text-[--wc-ink-muted] border-[--wc-stone]/30 hover:border-[--wc-stone]/50"
      }`}
    >
      {label}
    </button>
  );
}

function getCategoryColor(category: LogCategory): string {
  const colors: Record<LogCategory, string> = {
    quantum: "text-purple-700",
    observation: "text-blue-700",
    evolution: "text-emerald-700",
    rendering: "text-yellow-700",
    system: "text-[--wc-ink-muted]",
  };
  return colors[category];
}

function getLevelColor(level: LogLevel): string {
  const colors: Record<LogLevel, string> = {
    debug: "text-[--wc-ink-muted]",
    info: "text-blue-700",
    warn: "text-amber-700",
    error: "text-red-700",
  };
  return colors[level];
}

function LogEntryRow({
  log,
}: {
  log: {
    id: string;
    timestamp: Date;
    level: LogLevel;
    category: LogCategory;
    message: string;
    data?: unknown;
  };
}) {
  const [expanded, setExpanded] = useState(false);
  const time = log.timestamp.toLocaleTimeString("en-US", { hour12: false });

  return (
    <div
      className={`px-3 py-2 text-xs cursor-pointer hover:bg-black/5 ${
        log.level === "error" ? "bg-red-50/40" : log.level === "warn" ? "bg-amber-50/40" : ""
      }`}
      onClick={() => log.data && setExpanded(!expanded)}
    >
      <div className="flex items-start gap-2">
        <span className="text-[--wc-ink-muted]/60 font-mono shrink-0">{time}</span>
        <span className={`shrink-0 ${getCategoryColor(log.category)}`}>[{log.category}]</span>
        <span className={getLevelColor(log.level)}>{log.message}</span>
      </div>
      {expanded && log.data !== undefined && (
        <pre className="mt-2 p-2 bg-[--wc-paper]/80 rounded text-[--wc-ink-soft] overflow-x-auto">
          {String(JSON.stringify(log.data, null, 2))}
        </pre>
      )}
    </div>
  );
}
