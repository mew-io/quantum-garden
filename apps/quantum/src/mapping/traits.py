"""
Mapping quantum measurements to visual plant traits.

Converts raw qubit measurements into concrete visual properties
for rendering plant glyphs.
"""

from typing import Any

# Color palettes for different quantum states
COLOR_PALETTES = [
    ["#2D3436", "#636E72", "#B2BEC3"],  # Grayscale
    ["#6C5CE7", "#A29BFE", "#DFE6E9"],  # Purple
    ["#00B894", "#55EFC4", "#81ECEC"],  # Teal
    ["#E17055", "#FAB1A0", "#FFEAA7"],  # Warm
    ["#0984E3", "#74B9FF", "#DFE6E9"],  # Blue
    ["#D63031", "#FF7675", "#FD79A8"],  # Red/Pink
    ["#00CEC9", "#81ECEC", "#DFE6E9"],  # Cyan
    ["#FDCB6E", "#FFEAA7", "#F8E71C"],  # Yellow
]

# Base glyph patterns (8x8 pixel grids)
# 1 = filled, 0 = empty
GLYPH_PATTERNS = [
    # Pattern 0: Simple cross
    [
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
    ],
    # Pattern 1: Diamond
    [
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
    ],
    # Pattern 2: Circle
    [
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 0, 0, 1, 1, 1],
        [1, 1, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 1, 1],
        [1, 1, 1, 0, 0, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
    ],
    # Pattern 3: Square
    [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
    ],
]


def map_measurements_to_traits(
    measurements: list[int], qubit_count: int = 5
) -> dict[str, Any]:
    """
    Map quantum measurements to visual plant traits.

    Takes the raw measurement results and converts them into
    concrete visual properties for rendering.

    Args:
        measurements: List of integer measurement results
        qubit_count: Number of qubits used in the circuit (default: 5)

    Returns:
        Dictionary of resolved visual traits
    """
    if not measurements:
        # Return default traits if no measurements
        return {
            "glyphPattern": GLYPH_PATTERNS[0],
            "colorPalette": COLOR_PALETTES[0],
            "growthRate": 1.0,
            "opacity": 1.0,
        }

    # Use statistical properties of measurements
    # Most frequent value determines primary traits
    from collections import Counter

    counts = Counter(measurements)
    most_common = counts.most_common(1)[0][0]

    # Extract individual trait bits
    # Assuming 5 qubits: bits 0-1 for pattern, bits 2-4 for color
    pattern_bits = most_common & 0b11  # First 2 bits
    color_bits = (most_common >> 2) & 0b111  # Next 3 bits

    # Map to traits
    pattern_index = pattern_bits % len(GLYPH_PATTERNS)
    color_index = color_bits % len(COLOR_PALETTES)

    # Calculate growth rate from measurement variance
    mean_value = sum(measurements) / len(measurements)
    variance = sum((x - mean_value) ** 2 for x in measurements) / len(measurements)
    # Normalize variance to growth rate (0.5 - 2.0)
    # Max variance occurs when measurements are evenly split between 0 and max_value
    # For n qubits: max_value = 2^n - 1, max_variance ≈ (max_value/2)^2 = 2^(2n-2)
    max_variance = 2 ** (2 * qubit_count - 2)
    normalized_variance = min(variance / max_variance, 1.0)
    growth_rate = 0.5 + normalized_variance * 1.5
    growth_rate = min(2.0, max(0.5, growth_rate))

    # Opacity based on measurement consistency
    # More consistent = higher opacity
    consistency = counts.most_common(1)[0][1] / len(measurements)
    opacity = 0.7 + (consistency * 0.3)

    return {
        "glyphPattern": GLYPH_PATTERNS[pattern_index],
        "colorPalette": COLOR_PALETTES[color_index],
        "growthRate": round(growth_rate, 2),
        "opacity": round(opacity, 2),
    }
