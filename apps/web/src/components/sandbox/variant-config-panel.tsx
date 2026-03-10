"use client";

import {
  type PlantVariant,
  isVectorVariant,
  getKeyframeCount,
  getBaseTotalDuration,
} from "@quantum-garden/shared";

interface VariantConfigPanelProps {
  variant: PlantVariant;
}

/**
 * Configuration panel showing all variant settings.
 * Displays all options (enabled or disabled) so designers can see the full config.
 */
export function VariantConfigPanel({ variant }: VariantConfigPanelProps) {
  const isVector = isVectorVariant(variant);
  const keyframeCount = getKeyframeCount(variant);
  const totalDuration = getBaseTotalDuration(variant);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800">Variant Configuration</h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Basic Info */}
        <ConfigSection title="Basic Info">
          <ConfigRow label="ID" value={variant.id} mono />
          <ConfigRow label="Name" value={variant.name} />
          <ConfigRow
            label="Description"
            value={variant.description || "(none)"}
            muted={!variant.description}
          />
        </ConfigSection>

        {/* Spawn Settings */}
        <ConfigSection title="Spawn Settings">
          <ConfigToggle
            label="Spawning"
            enabled={!variant.disabled}
            description={
              variant.disabled
                ? "This variant will not spawn in the garden"
                : "This variant can spawn in the garden"
            }
          />
          <ConfigRow
            label="Rarity"
            value={`${(variant.rarity * 100).toFixed(0)}%`}
            badge={variant.rarity < 0.5 ? "rare" : variant.rarity < 0.8 ? "uncommon" : "common"}
            badgeColor={variant.rarity < 0.5 ? "amber" : variant.rarity < 0.8 ? "blue" : "gray"}
          />
          <ConfigToggle
            label="Requires Observation"
            enabled={variant.requiresObservationToGerminate}
            description="Plant must be observed to germinate"
          />
        </ConfigSection>

        {/* Animation Settings */}
        <ConfigSection title="Animation Settings">
          <ConfigRow label="Keyframes" value={`${keyframeCount}`} />
          <ConfigRow label="Total Duration" value={`${totalDuration}s`} />
          {isVector && (
            <ConfigRow label="Render Mode" value="Vector" badge="vector" badgeColor="blue" />
          )}
          <ConfigToggle
            label="Loop"
            enabled={!!variant.loop}
            description="Animation loops infinitely"
          />
          <ConfigToggle
            label="Tweening"
            enabled={!!variant.tweenBetweenKeyframes}
            description="Smooth interpolation between keyframes"
          />
        </ConfigSection>

        {/* Color Variations */}
        <ConfigSection title="Color Variations">
          {variant.colorVariations && variant.colorVariations.length > 0 ? (
            <div className="space-y-2">
              {variant.colorVariations.map((cv) => (
                <div
                  key={cv.name}
                  className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">{cv.name}</span>
                    <span className="text-xs text-gray-500">
                      {(cv.weight * 100).toFixed(0)}% weight
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {Object.entries(cv.palettes).map(([keyframeName, colors]) => (
                      <div key={keyframeName} className="flex gap-0.5" title={keyframeName}>
                        {colors.slice(0, 3).map((color, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded-sm border border-gray-300"
                            style={{ backgroundColor: color }}
                            title={`${keyframeName}: ${color}`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic py-2">Fixed colors (no variations)</div>
          )}
        </ConfigSection>

        {/* Keyframe Summary */}
        <ConfigSection title="Keyframe Summary">
          <div className="space-y-1">
            {isVector
              ? // Vector keyframes
                variant.vectorKeyframes?.map((kf, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                      <span className="font-medium text-gray-700">{kf.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{kf.duration}s</span>
                      {kf.strokeOpacity !== 1 && <span>α{kf.strokeOpacity}</span>}
                      {kf.scale !== undefined && kf.scale !== 1 && <span>×{kf.scale}</span>}
                      <div
                        className="w-3 h-3 rounded-sm border border-gray-300"
                        style={{ backgroundColor: kf.strokeColor }}
                        title={kf.strokeColor}
                      />
                      <span className="text-gray-400">{kf.primitives.length} shapes</span>
                    </div>
                  </div>
                ))
              : // Pixel keyframes
                variant.keyframes.map((kf, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                      <span className="font-medium text-gray-700">{kf.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{kf.duration}s</span>
                      {kf.opacity !== undefined && kf.opacity !== 1 && <span>α{kf.opacity}</span>}
                      {kf.scale !== undefined && kf.scale !== 1 && <span>×{kf.scale}</span>}
                      <div className="flex gap-0.5">
                        {kf.palette.slice(0, 3).map((color, ci) => (
                          <div
                            key={ci}
                            className="w-3 h-3 rounded-sm border border-gray-300"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </ConfigSection>
      </div>
    </div>
  );
}

// Helper components

function ConfigSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</h4>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function ConfigRow({
  label,
  value,
  mono,
  muted,
  badge,
  badgeColor,
}: {
  label: string;
  value: string;
  mono?: boolean;
  muted?: boolean;
  badge?: string;
  badgeColor?: "gray" | "blue" | "amber" | "green" | "purple";
}) {
  const badgeColors = {
    gray: "bg-gray-100 text-gray-600",
    blue: "bg-blue-100 text-blue-700",
    amber: "bg-amber-100 text-amber-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        {badge && (
          <span className={`text-xs px-1.5 py-0.5 rounded ${badgeColors[badgeColor || "gray"]}`}>
            {badge}
          </span>
        )}
        <span
          className={`text-sm ${mono ? "font-mono" : ""} ${muted ? "text-gray-400 italic" : "text-gray-900"}`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function ConfigToggle({
  label,
  enabled,
  description,
}: {
  label: string;
  enabled: boolean;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div>
        <span className="text-sm text-gray-600">{label}</span>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
          enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
        }`}
      >
        {enabled ? (
          <>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Enabled
          </>
        ) : (
          <>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Disabled
          </>
        )}
      </div>
    </div>
  );
}
