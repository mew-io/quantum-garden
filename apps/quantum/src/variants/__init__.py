"""
Plant Variants Module

Loads variant definitions from JSON (exported from TypeScript).
TypeScript is the single source of truth for variant definitions.

Usage:
    from src.variants import get_variant, get_all_variants, select_variant

To regenerate variants.json:
    cd apps/web && pnpm export-variants
"""

from .loader import (
    ColorVariation,
    GlyphKeyframe,
    PlantVariant,
    get_all_variants,
    get_variant,
    select_color_variation,
    select_variant,
)

__all__ = [
    "get_variant",
    "get_all_variants",
    "select_variant",
    "select_color_variation",
    "PlantVariant",
    "GlyphKeyframe",
    "ColorVariation",
]
