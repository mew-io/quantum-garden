"""
Variant Loader

Loads plant variant definitions from JSON file exported by TypeScript.
TypeScript is the single source of truth - Python only consumes.

See docs/variants-and-lifecycle.md for architecture documentation.
"""

import json
from pathlib import Path
from typing import TypedDict


class GlyphKeyframe(TypedDict, total=False):
    """A keyframe in a plant's lifecycle animation."""

    name: str
    duration: float  # seconds
    pattern: list[list[int]]  # 8x8 grid
    palette: list[str]  # hex colors
    opacity: float  # optional, default 1.0
    scale: float  # optional, default 1.0


class ColorVariation(TypedDict):
    """A color variation for multi-color variants."""

    name: str
    weight: float
    palettes: dict[str, list[str]]  # keyframe name -> palette


class PlantVariant(TypedDict, total=False):
    """A plant variant (species) definition."""

    id: str
    name: str
    description: str  # optional
    rarity: float  # 0.0-1.0
    requiresObservationToGerminate: bool
    keyframes: list[GlyphKeyframe]
    colorVariations: list[ColorVariation]  # optional
    tweenBetweenKeyframes: bool  # optional, default False
    loop: bool  # optional, default False


# Cache for loaded variants
_variants_cache: list[PlantVariant] | None = None


def _get_variants_path() -> Path:
    """Get the path to variants.json."""
    return Path(__file__).parent.parent / "data" / "variants.json"


def _load_variants() -> list[PlantVariant]:
    """Load variants from JSON file."""
    global _variants_cache

    if _variants_cache is not None:
        return _variants_cache

    variants_path = _get_variants_path()

    if not variants_path.exists():
        raise FileNotFoundError(
            f"Variants file not found: {variants_path}\n"
            "Run 'pnpm export-variants' from apps/web to generate it."
        )

    with open(variants_path) as f:
        _variants_cache = json.load(f)

    return _variants_cache


def get_all_variants() -> list[PlantVariant]:
    """Get all registered plant variants."""
    return _load_variants()


def get_variant(variant_id: str) -> PlantVariant | None:
    """Get a variant by its ID."""
    for variant in _load_variants():
        if variant["id"] == variant_id:
            return variant
    return None


def select_variant(probability: float) -> PlantVariant:
    """
    Select a variant based on quantum probability.

    Uses rarity values to weight selection.
    Lower probability values select rarer variants.

    Args:
        probability: Random value from quantum measurement (0.0-1.0)

    Returns:
        Selected variant
    """
    variants = _load_variants()

    # Sort by rarity (rarest first)
    sorted_variants = sorted(variants, key=lambda v: v.get("rarity", 1.0))

    # Calculate total rarity for normalization
    total_rarity = sum(v.get("rarity", 1.0) for v in sorted_variants)

    # Select based on probability
    accumulated = 0.0
    for variant in sorted_variants:
        accumulated += variant.get("rarity", 1.0) / total_rarity
        if probability <= accumulated:
            return variant

    # Fallback to most common (last in sorted list)
    return sorted_variants[-1]


def select_color_variation(variant: PlantVariant, probability: float) -> str | None:
    """
    Select a color variation for multi-color variants.

    Args:
        variant: The plant variant
        probability: Random value from quantum measurement (0.0-1.0)

    Returns:
        Selected color variation name, or None for fixed-color variants
    """
    color_variations = variant.get("colorVariations")
    if not color_variations:
        return None

    # Calculate total weight
    total_weight = sum(v["weight"] for v in color_variations)

    # Select based on probability
    accumulated = 0.0
    for variation in color_variations:
        accumulated += variation["weight"] / total_weight
        if probability <= accumulated:
            return variation["name"]

    # Fallback to last variation
    return color_variations[-1]["name"]


def get_effective_palette(
    keyframe: GlyphKeyframe,
    variant: PlantVariant,
    color_variation_name: str | None,
) -> list[str]:
    """
    Get the effective palette for a keyframe, considering color variations.

    Args:
        keyframe: The keyframe
        variant: The plant variant
        color_variation_name: Selected color variation name (or None)

    Returns:
        The palette to use for rendering
    """
    if not color_variation_name:
        return keyframe["palette"]

    color_variations = variant.get("colorVariations")
    if not color_variations:
        return keyframe["palette"]

    # Find the color variation
    variation = next(
        (v for v in color_variations if v["name"] == color_variation_name),
        None,
    )
    if not variation:
        return keyframe["palette"]

    # Check if this keyframe has an override
    keyframe_name = keyframe["name"]
    return variation["palettes"].get(keyframe_name, keyframe["palette"])


def reload_variants() -> None:
    """Force reload of variants from JSON file."""
    global _variants_cache
    _variants_cache = None
    _load_variants()
