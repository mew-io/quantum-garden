"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useVariantSandboxStore } from "@/stores/variant-sandbox-store";

/**
 * URL parameter names for sandbox state
 */
const URL_PARAMS = {
  VARIANT: "variant",
  COLOR: "color",
} as const;

/**
 * Hook to synchronize sandbox state with URL query parameters.
 *
 * URL format:
 * - /sandbox - gallery view
 * - /sandbox?variant=simple-bloom - detail view with variant
 * - /sandbox?variant=simple-bloom&color=red - with color variation
 *
 * This hook:
 * 1. Reads URL params on mount and updates store state
 * 2. Updates URL when store state changes (via actions)
 */
export function useSandboxUrlSync() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initializedRef = useRef(false);

  const {
    viewMode,
    selectedVariantId,
    selectedColorVariation,
    openVariantDetail,
    selectColorVariation,
  } = useVariantSandboxStore();

  // Read URL params on mount and sync to store
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const variantParam = searchParams.get(URL_PARAMS.VARIANT);
    const colorParam = searchParams.get(URL_PARAMS.COLOR);

    // Variant takes priority - if set, go to detail view
    if (variantParam) {
      openVariantDetail(variantParam);
      if (colorParam) {
        selectColorVariation(colorParam);
      }
    }
    // Default is gallery view, no action needed
  }, [searchParams, openVariantDetail, selectColorVariation]);

  // Update URL when store state changes
  useEffect(() => {
    // Skip on first render (initialization handled above)
    if (!initializedRef.current) return;

    const params = new URLSearchParams();

    if (viewMode === "detail" && selectedVariantId) {
      params.set(URL_PARAMS.VARIANT, selectedVariantId);
      if (selectedColorVariation) {
        params.set(URL_PARAMS.COLOR, selectedColorVariation);
      }
    }
    // Gallery view has no params (clean URL)

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

    // Use replace to avoid cluttering browser history on every state change
    router.replace(newUrl, { scroll: false });
  }, [viewMode, selectedVariantId, selectedColorVariation, pathname, router]);
}

/**
 * Build a URL for a specific sandbox state.
 * Useful for generating shareable links.
 */
export function buildSandboxUrl(options: { variantId?: string; colorVariation?: string }): string {
  const params = new URLSearchParams();

  if (options.variantId) {
    params.set(URL_PARAMS.VARIANT, options.variantId);
    if (options.colorVariation) {
      params.set(URL_PARAMS.COLOR, options.colorVariation);
    }
  }

  const queryString = params.toString();
  return queryString ? `/seed-box?${queryString}` : "/seed-box";
}
