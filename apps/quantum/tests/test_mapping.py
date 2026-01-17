"""Tests for trait mapping."""

import pytest
from src.mapping.traits import map_measurements_to_traits


def test_map_empty_measurements():
    """Test mapping with empty measurements returns defaults."""
    traits = map_measurements_to_traits([])

    assert "glyphPattern" in traits
    assert "colorPalette" in traits
    assert traits["growthRate"] == 1.0
    assert traits["opacity"] == 1.0


def test_map_single_measurement():
    """Test mapping with a single measurement."""
    traits = map_measurements_to_traits([5])

    assert "glyphPattern" in traits
    assert "colorPalette" in traits
    assert isinstance(traits["growthRate"], float)
    assert isinstance(traits["opacity"], float)


def test_map_multiple_measurements():
    """Test mapping with multiple measurements."""
    measurements = [0, 1, 1, 2, 3, 1, 1, 0, 1]
    traits = map_measurements_to_traits(measurements)

    # Most common is 1, so should influence pattern
    assert "glyphPattern" in traits
    assert len(traits["glyphPattern"]) == 8  # 8x8 grid
    assert len(traits["glyphPattern"][0]) == 8


def test_map_consistent_measurements():
    """Test that consistent measurements produce high opacity."""
    # All same value = very consistent
    measurements = [7] * 100
    traits = map_measurements_to_traits(measurements)

    # Should have high opacity (close to 1.0)
    assert traits["opacity"] >= 0.9


def test_map_varied_measurements():
    """Test that varied measurements produce lower opacity."""
    # Very varied values
    measurements = list(range(32)) * 3  # 0-31 repeated
    traits = map_measurements_to_traits(measurements)

    # Should have lower opacity
    assert traits["opacity"] < 0.9


def test_growth_rate_bounds():
    """Test that growth rate stays within bounds."""
    # Test with various measurement patterns
    for i in range(10):
        measurements = [i * 3] * 50 + [i] * 50
        traits = map_measurements_to_traits(measurements)

        assert 0.5 <= traits["growthRate"] <= 2.0
