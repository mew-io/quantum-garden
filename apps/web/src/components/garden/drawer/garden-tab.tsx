"use client";

import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc/client";
import { useGardenStore } from "@/stores/garden-store";
import { SeedIcon, SproutIcon, EyeIcon } from "@/components/garden/icons";
import type { QuantumPropertySchema, CircuitType } from "@quantum-garden/shared";
import { getVariantById } from "@quantum-garden/shared";
import { getCircuitInfo } from "@/lib/quantum-explanations";

interface GardenTabProps {
  isActive: boolean;
  focusedPlantId?: string | null;
  onFocusedPlantHandled?: () => void;
}

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
    <div className="flex items-center justify-between px-3 py-1.5 bg-[--wc-paper]/60 rounded">
      <div className="flex items-center gap-2">
        <span className={colorClasses[color]}>{icon}</span>
        <span className="text-xs text-[--wc-ink-muted]">{label}</span>
      </div>
      <span className={`text-sm font-mono ${colorClasses[color]}`}>{value}</span>
    </div>
  );
}

export function GardenTab({ isActive, focusedPlantId, onFocusedPlantHandled }: GardenTabProps) {
  const { plants: clientPlants, lastGerminationTime } = useGardenStore();
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [detailPlantId, setDetailPlantId] = useState<string | null>(null);

  // Handle focused plant from parent (e.g. clicking a plant on the canvas)
  useEffect(() => {
    if (focusedPlantId) {
      setSelectedPlantId(focusedPlantId);
      setDetailPlantId(focusedPlantId);
      onFocusedPlantHandled?.();
    }
  }, [focusedPlantId, onFocusedPlantHandled]);

  // Listen for plant selection events from the canvas
  useEffect(() => {
    const handlePlantSelect = (e: CustomEvent<{ plantId: string }>) => {
      setSelectedPlantId(e.detail.plantId);
      setDetailPlantId(e.detail.plantId);
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

  const { data: plants } = trpc.plants.list.useQuery(undefined, {
    enabled: isActive,
    refetchInterval: isActive ? 2000 : false,
  });

  const { germinatedCount, dormantCount, observedCount } = useMemo(() => {
    const source = plants ?? clientPlants;
    return {
      germinatedCount: source.filter((p) => p.germinatedAt !== null).length,
      dormantCount: source.filter((p) => p.germinatedAt === null).length,
      observedCount: source.filter((p) => p.observed).length,
    };
  }, [plants, clientPlants]);

  const totalCount = plants?.length ?? clientPlants.length;

  const formatRelativeTime = (timestamp: number | null): string => {
    if (!timestamp) return "—";
    const diff = Date.now() - timestamp;
    if (diff < 10_000) return "just now";
    if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
    return `${Math.floor(diff / 3600_000)}h ago`;
  };

  // If viewing a plant detail, show that instead
  if (detailPlantId) {
    return (
      <div className="flex-1 min-h-0 min-w-0 overflow-y-auto p-4">
        <PlantDetailView
          plantId={detailPlantId}
          isActive={isActive}
          onBack={() => setDetailPlantId(null)}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
      {/* Summary stats */}
      <section className="space-y-1">
        <div className="grid grid-cols-3 gap-1.5">
          <StatusItem icon={<SeedIcon />} label="Seeds" value={dormantCount} color="gray" />
          <StatusItem icon={<SproutIcon />} label="Growing" value={germinatedCount} color="green" />
          <StatusItem icon={<EyeIcon />} label="Observed" value={observedCount} color="cyan" />
        </div>
        {lastGerminationTime && (
          <div className="flex justify-between text-xs px-1 pt-1">
            <span className="text-[--wc-ink-muted]">Last germination</span>
            <span className="text-emerald-700">{formatRelativeTime(lastGerminationTime)}</span>
          </div>
        )}
      </section>

      {/* Plant list */}
      <section>
        <h4 className="text-[--wc-ink-soft] text-[11px] font-semibold uppercase tracking-wider mb-3">
          Plants ({totalCount})
        </h4>
        <div className="space-y-1">
          {(plants ?? clientPlants).map((plant) => {
            const isObserved =
              clientPlants.find((cp) => cp.id === plant.id)?.observed ?? plant.observed;
            const variant = getVariantById(plant.variantId);
            return (
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
                      isObserved
                        ? "bg-yellow-400"
                        : plant.germinatedAt
                          ? "bg-green-500"
                          : "bg-[--wc-stone]/40"
                    }`}
                  />
                  <span>{variant?.name ?? plant.variantId}</span>
                </div>
                <span className="text-[--wc-ink-muted]/60 font-mono">{plant.id.slice(-6)}</span>
              </button>
            );
          })}
          {totalCount === 0 && (
            <div className="text-center text-[--wc-ink-muted] text-xs py-4">
              No plants in the garden yet
            </div>
          )}
        </div>
      </section>
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
  const { data, isLoading } = trpc.plants.getDebugDetail.useQuery(
    { id: plantId },
    { enabled: isActive, refetchInterval: isActive ? 3000 : false }
  );

  const clientPlant = useGardenStore((s) => s.plants.find((p) => p.id === plantId));

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

  const { plant: serverPlant, quantumRecord, entangledPlants } = data;
  const plant = {
    ...serverPlant,
    observed: clientPlant?.observed ?? serverPlant.observed,
    visualState: clientPlant?.visualState ?? serverPlant.visualState,
    observedAt: clientPlant?.observed
      ? (serverPlant.observedAt ?? new Date())
      : serverPlant.observedAt,
    traits: serverPlant.traits ?? clientPlant?.traits,
  };

  const variant = getVariantById(plant.variantId);
  const traits = plant.traits;
  const signals = traits?.quantumSignals;

  return (
    <div className="space-y-6 pb-4">
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
        <h4 className="text-[--wc-ink-soft] text-[11px] font-semibold uppercase tracking-wider mb-3">
          Plant Info
        </h4>
        <div className="bg-[--wc-paper]/60 rounded p-3 space-y-2 text-xs">
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
      {quantumRecord && <CircuitSection quantumRecord={quantumRecord} />}

      {/* Measurement Data */}
      <section>
        <h4 className="text-[--wc-ink-soft] text-[11px] font-semibold uppercase tracking-wider mb-3">
          Measurement Data
        </h4>
        {signals ? (
          <div className="space-y-6">
            {!quantumRecord?.probabilities?.length && plant.observed && (
              <div className="bg-amber-50/60 border border-amber-200/40 rounded p-2 text-[10px] text-amber-800 leading-relaxed">
                Mock signals — quantum pool was unavailable at observation time. Traits are seeded
                from the circuit definition.
              </div>
            )}

            {/* Quantum Signals */}
            <div className="bg-[--wc-paper]/60 rounded p-3 space-y-4">
              <p className="text-[10px] text-[--wc-ink-muted] leading-relaxed">
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
              <div className="bg-[--wc-paper]/60 rounded p-3 space-y-2">
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
              <div className="bg-[--wc-paper]/60 rounded p-3 space-y-2 text-xs">
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

// ============================================================================
// Helper components
// ============================================================================

function CircuitSection({
  quantumRecord,
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
}) {
  const circuitInfo = getCircuitInfo(quantumRecord.circuitId as CircuitType);

  return (
    <section>
      <h4 className="text-[--wc-ink-soft] text-[11px] font-semibold uppercase tracking-wider mb-3">
        Quantum Circuit
      </h4>
      <div className="bg-[--wc-paper]/60 rounded p-3 space-y-4 text-xs min-w-0">
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-purple-700 font-medium">{circuitInfo.name}</span>
            <span className="text-[--wc-ink-muted] font-mono text-[10px]">
              {circuitInfo.qubits} qubit
              {circuitInfo.qubits > 1 ? "s" : ""}
            </span>
          </div>
          <p className="text-[--wc-ink-muted] text-[11px] leading-relaxed">{circuitInfo.concept}</p>
        </div>

        <pre className="p-2 bg-[--wc-paper]/80 rounded text-[10px] text-purple-700/80 font-mono leading-tight overflow-x-auto max-w-full">
          {circuitInfo.diagram.join("\n")}
        </pre>

        <p className="text-[10px] text-[--wc-ink-muted] leading-relaxed">
          {circuitInfo.gateDescription}
        </p>

        <div className="border-t border-[--wc-stone]/15 pt-3 space-y-2">
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

        <div className="flex items-baseline gap-2 text-[10px] min-w-0">
          <span className="text-[--wc-ink-muted] shrink-0">Circuit</span>
          <span className="font-mono text-[--wc-ink-soft] truncate">
            {JSON.stringify(quantumRecord.circuitDefinition)}
          </span>
        </div>
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
    <div>
      <div className="flex justify-between items-baseline text-[11px] mb-1">
        <span className="text-[--wc-ink-soft] font-medium">
          {label}
          {description && (
            <span className="text-[--wc-ink-muted] font-normal ml-1.5">({description})</span>
          )}
        </span>
        <span className="text-[--wc-ink-soft] font-mono text-[10px]">{value.toFixed(3)}</span>
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
