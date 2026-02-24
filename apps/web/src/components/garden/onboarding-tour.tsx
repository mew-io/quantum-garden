"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "quantum-garden-tour-completed";

/**
 * Tour step definition
 */
interface TourStep {
  /** Unique identifier for the step */
  id: string;
  /** Title shown in the spotlight */
  title: string;
  /** Description text */
  description: string;
  /** CSS selector or position hint for highlighting */
  target?:
    | "toolbar"
    | "canvas"
    | "timeline-button"
    | "sound-button"
    | "help-button"
    | "debug-button";
  /** Position of the tooltip relative to the spotlight */
  position: "top" | "bottom" | "left" | "right" | "center";
}

/**
 * Tour steps - gentle introduction to the garden
 */
const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to the Quantum Garden",
    description: "Let me show you around. This tour is optional—you can skip it anytime.",
    position: "center",
  },
  {
    id: "canvas",
    title: "The Garden",
    description:
      "Plants exist in quantum superposition until observed. Watch for the drifting reticle—when it aligns with a plant, observation begins.",
    target: "canvas",
    position: "top",
  },
  {
    id: "superposition",
    title: "Superposed Plants",
    description:
      "Shimering, translucent plants haven't been observed yet. Their traits are undetermined until you witness them.",
    target: "canvas",
    position: "top",
  },
  {
    id: "observation",
    title: "Observation",
    description:
      "When the reticle dwells on a plant, it collapses from superposition into a definite state. Watch for the celebration effect.",
    target: "canvas",
    position: "top",
  },
  {
    id: "toolbar",
    title: "Toolbar",
    description:
      "Access controls and information here. The garden stats show how many plants are germinated and observed.",
    target: "toolbar",
    position: "bottom",
  },
  {
    id: "timeline",
    title: "Time Travel",
    description:
      "Press T or click the Timeline button to scrub through the garden's history. Watch past germinations and observations unfold.",
    target: "timeline-button",
    position: "bottom",
  },
  {
    id: "sound",
    title: "Sound",
    description:
      "Toggle garden sounds on or off. Sound is off by default and can enhance the contemplative experience.",
    target: "sound-button",
    position: "bottom",
  },
  {
    id: "complete",
    title: "Enjoy the Garden",
    description:
      "The garden evolves whether anyone is watching or not. Take your time. Observe. Reflect.",
    position: "center",
  },
];

interface OnboardingTourProps {
  /** Whether the tour is currently active */
  isActive: boolean;
  /** Callback when tour completes or is dismissed */
  onComplete: () => void;
}

/**
 * OnboardingTour - A gentle, step-by-step introduction to the garden
 *
 * Features:
 * - Subtle spotlight highlighting of UI elements
 * - Calm, meditative pacing matching garden aesthetic
 * - Skip button always available
 * - Progress indicator
 * - Completion tracked in localStorage
 */
export function OnboardingTour({ isActive, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Fade in when activated
  useEffect(() => {
    if (isActive) {
      setCurrentStep(0);
      // Small delay for smoother transition
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [isActive]);

  const handleComplete = useCallback(() => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
    // Wait for fade out
    setTimeout(() => {
      onComplete();
    }, 300);
  }, [onComplete]);

  const handleNext = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, handleComplete]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    handleComplete();
  }, [handleComplete]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case "Enter":
        case " ":
          e.preventDefault();
          handleNext();
          break;
        case "ArrowLeft":
          e.preventDefault();
          handlePrevious();
          break;
        case "Escape":
          e.preventDefault();
          handleSkip();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, handleNext, handlePrevious, handleSkip]);

  if (!isActive) return null;

  const step = TOUR_STEPS[currentStep]!;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  // Calculate spotlight position based on target
  const spotlightPosition = getSpotlightPosition(step.target);

  return (
    <div
      className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop with cutout for spotlight */}
      <div
        className="absolute inset-0 bg-[#3A352E]/60 transition-all duration-500"
        onClick={handleNext}
      />

      {/* Spotlight highlight (if targeting specific element) */}
      {spotlightPosition && (
        <div
          className="absolute pointer-events-none transition-all duration-500 ease-out"
          style={{
            left: spotlightPosition.x,
            top: spotlightPosition.y,
            width: spotlightPosition.width,
            height: spotlightPosition.height,
            boxShadow: "0 0 0 9999px rgba(58, 53, 46, 0.6)",
            borderRadius: "12px",
          }}
        >
          {/* Pulsing ring around spotlight */}
          <div className="absolute inset-0 rounded-xl border-2 border-[--wc-bark]/40 animate-pulse" />
        </div>
      )}

      {/* Tooltip card */}
      <div
        className={`absolute transition-all duration-500 ease-out ${getTooltipClasses(
          step.position,
          spotlightPosition
        )}`}
        style={getTooltipStyle(step.position, spotlightPosition)}
      >
        <div className="bg-[--wc-cream] backdrop-blur-md rounded-xl border border-[--wc-stone]/30 shadow-2xl p-6 max-w-sm">
          {/* Step indicator */}
          <div className="flex items-center gap-1.5 mb-3">
            {TOUR_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all duration-300 ${
                  idx === currentStep
                    ? "w-4 bg-[--wc-bark]"
                    : idx < currentStep
                      ? "w-2 bg-[--wc-bark]/50"
                      : "w-2 bg-[--wc-stone]/40"
                }`}
              />
            ))}
          </div>

          {/* Title */}
          <h3 className="text-lg font-medium text-[--wc-ink] mb-2">{step.title}</h3>

          {/* Description */}
          <p className="text-[--wc-ink-soft] text-sm leading-relaxed mb-4">{step.description}</p>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-[--wc-ink-muted] text-sm hover:text-[--wc-ink-soft] transition-colors"
            >
              Skip tour
            </button>

            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <button
                  onClick={handlePrevious}
                  className="px-3 py-1.5 text-sm text-[--wc-ink-soft] hover:text-[--wc-ink] transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-4 py-1.5 bg-[--wc-bark] hover:bg-[#6A5E4D] text-white text-sm rounded-lg transition-colors"
              >
                {isLastStep ? "Finish" : "Next"}
              </button>
            </div>
          </div>

          {/* Keyboard hint */}
          <p className="text-[--wc-ink-muted] text-xs mt-3 text-center">
            Use arrow keys to navigate, Esc to skip
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Get approximate position for spotlight based on target.
 * In a real implementation, this would query the DOM for exact positions.
 */
function getSpotlightPosition(
  target?: TourStep["target"]
): { x: number; y: number; width: number; height: number } | null {
  if (typeof window === "undefined") return null;

  switch (target) {
    case "toolbar":
      // Top-left toolbar area
      return {
        x: 16,
        y: 16,
        width: 280,
        height: 48,
      };
    case "canvas":
      // Center of the canvas (most of screen)
      return {
        x: window.innerWidth * 0.2,
        y: window.innerHeight * 0.2,
        width: window.innerWidth * 0.6,
        height: window.innerHeight * 0.5,
      };
    case "timeline-button":
      // Timeline button in toolbar (approximate)
      return {
        x: 16,
        y: 16,
        width: 100,
        height: 48,
      };
    case "sound-button":
      // Sound button (approximate position)
      return {
        x: 120,
        y: 16,
        width: 48,
        height: 48,
      };
    case "help-button":
      // Help button
      return {
        x: 180,
        y: 16,
        width: 48,
        height: 48,
      };
    default:
      return null;
  }
}

/**
 * Get CSS classes for tooltip positioning
 */
function getTooltipClasses(
  position: TourStep["position"],
  spotlight: ReturnType<typeof getSpotlightPosition>
): string {
  if (!spotlight || position === "center") {
    return "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2";
  }

  switch (position) {
    case "top":
      return "left-1/2 -translate-x-1/2";
    case "bottom":
      return "left-1/2 -translate-x-1/2";
    case "left":
      return "top-1/2 -translate-y-1/2";
    case "right":
      return "top-1/2 -translate-y-1/2";
    default:
      return "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2";
  }
}

/**
 * Get inline styles for tooltip positioning
 */
function getTooltipStyle(
  position: TourStep["position"],
  spotlight: ReturnType<typeof getSpotlightPosition>
): React.CSSProperties {
  if (!spotlight || position === "center") {
    return {};
  }

  const margin = 20;

  switch (position) {
    case "top":
      return {
        top: spotlight.y + spotlight.height + margin,
      };
    case "bottom":
      return {
        top: Math.max(spotlight.y - 200, margin),
      };
    case "left":
      return {
        left: spotlight.x + spotlight.width + margin,
      };
    case "right":
      return {
        left: Math.max(spotlight.x - 380, margin),
      };
    default:
      return {};
  }
}

/**
 * Check if the tour has been completed before.
 */
export function isTourCompleted(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

/**
 * Reset the tour completion status.
 */
export function resetTourCompletion(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
