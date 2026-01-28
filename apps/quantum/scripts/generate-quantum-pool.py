"""
Generate pre-computed quantum result pool.

This script generates a pool of pre-computed quantum measurement results
that can be used for instant trait revelation during plant observation.

Pool Structure:
- 100 results per circuit type (5 types = 500 total results)
- Each result includes measurements, counts, probabilities, and resolved traits
- Error mitigation disabled for authentic quantum results
- Results are deterministically selected based on plant ID

Usage:
    cd apps/quantum
    uv run python scripts/generate-quantum-pool.py

    # With specific execution mode:
    uv run python scripts/generate-quantum-pool.py --mode simulator
    uv run python scripts/generate-quantum-pool.py --mode mock
"""

import argparse
import asyncio
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.circuits import ExecutionMode, get_circuit, get_execution_mode
from src.circuits.base import QuantumCircuitExecutor


# Pool configuration
POOL_SIZE_PER_CIRCUIT = 100
CIRCUIT_TYPES = ["superposition", "bell_pair", "ghz_state", "interference", "variational"]
DEFAULT_SHOTS = 100


async def generate_result_for_circuit(
    circuit_type: str, index: int, execution_mode: ExecutionMode
) -> dict:
    """Generate a single quantum result for a circuit type."""
    print(f"  [{index + 1}/{POOL_SIZE_PER_CIRCUIT}] Generating {circuit_type} result...")

    # Get circuit instance
    circuit_executor = get_circuit(circuit_type)

    # Generate circuit with deterministic seed
    seed = hash(f"{circuit_type}_{index}") & 0xFFFFFFFF  # 32-bit seed
    circuit = circuit_executor.generate(seed)

    # Execute circuit with error mitigation disabled
    result = await circuit_executor.execute(
        circuit, shots=DEFAULT_SHOTS, mode=execution_mode
    )

    # Map measurements to traits
    traits = circuit_executor.map_measurements(result.measurements)

    # Build result entry
    return {
        "index": index,
        "measurements": result.measurements,
        "counts": result.counts,
        "probabilities": {
            bitstring: count / DEFAULT_SHOTS
            for bitstring, count in result.counts.items()
        },
        "traits": traits.to_dict(),
        "executionMode": execution_mode.value,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "shots": DEFAULT_SHOTS,
        "errorMitigationDisabled": True,  # Always true for authentic results
    }


async def generate_pool_for_circuit(
    circuit_type: str, execution_mode: ExecutionMode
) -> list[dict]:
    """Generate complete pool for a single circuit type."""
    print(f"\nGenerating pool for {circuit_type}...")

    results = []
    for i in range(POOL_SIZE_PER_CIRCUIT):
        result = await generate_result_for_circuit(circuit_type, i, execution_mode)
        results.append(result)

    print(f"  ✓ Generated {len(results)} results for {circuit_type}")
    return results


async def generate_complete_pool(execution_mode: ExecutionMode) -> dict:
    """Generate the complete quantum pool for all circuit types."""
    print(f"\n{'=' * 60}")
    print(f"Generating Quantum Result Pool")
    print(f"{'=' * 60}")
    print(f"Pool size per circuit: {POOL_SIZE_PER_CIRCUIT}")
    print(f"Circuit types: {', '.join(CIRCUIT_TYPES)}")
    print(f"Total results: {POOL_SIZE_PER_CIRCUIT * len(CIRCUIT_TYPES)}")
    print(f"Execution mode: {execution_mode.value.upper()}")
    print(f"Error mitigation: DISABLED")
    print(f"{'=' * 60}")

    pools = {}
    for circuit_type in CIRCUIT_TYPES:
        pools[circuit_type] = await generate_pool_for_circuit(
            circuit_type, execution_mode
        )

    # Build complete pool structure
    pool = {
        "metadata": {
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "poolSize": POOL_SIZE_PER_CIRCUIT,
            "totalResults": len(CIRCUIT_TYPES) * POOL_SIZE_PER_CIRCUIT,
            "executionMode": execution_mode.value,
            "errorMitigationDisabled": True,
        },
        "pools": pools,
    }

    return pool


def save_pool(pool: dict, output_path: Path) -> None:
    """Save the quantum pool to a JSON file."""
    # Ensure output directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Write pool to file
    with open(output_path, "w") as f:
        json.dump(pool, f, indent=2)

    # Print file size
    size_mb = output_path.stat().st_size / (1024 * 1024)
    print(f"\n✓ Pool saved to: {output_path}")
    print(f"  File size: {size_mb:.2f} MB")


async def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Generate pre-computed quantum result pool"
    )
    parser.add_argument(
        "--mode",
        type=str,
        choices=["mock", "simulator", "hardware"],
        help="Execution mode (default: auto-detect from environment)",
    )
    parser.add_argument(
        "--output",
        type=str,
        default="src/data/quantum-pool.json",
        help="Output file path (default: src/data/quantum-pool.json)",
    )

    args = parser.parse_args()

    # Determine execution mode
    if args.mode:
        if args.mode == "mock":
            execution_mode = ExecutionMode.MOCK
        elif args.mode == "simulator":
            execution_mode = ExecutionMode.SIMULATOR
        else:
            execution_mode = ExecutionMode.HARDWARE
    else:
        execution_mode = get_execution_mode()

    # Warn if using hardware
    if execution_mode == ExecutionMode.HARDWARE:
        print("\n⚠️  WARNING: Using HARDWARE execution mode")
        print("   This will consume quantum hardware credits!")
        confirm = input("   Continue? (yes/no): ")
        if confirm.lower() != "yes":
            print("Aborted.")
            return

    # Generate pool
    pool = await generate_complete_pool(execution_mode)

    # Save to file
    output_path = Path(__file__).parent.parent / args.output
    save_pool(pool, output_path)

    print(f"\n{'=' * 60}")
    print("Pool generation complete!")
    print(f"{'=' * 60}")
    print(f"Total results: {pool['metadata']['totalResults']}")
    print(f"Execution mode: {pool['metadata']['executionMode']}")
    print(f"\nNext steps:")
    print(f"  1. Commit the pool file to the repository")
    print(f"  2. Update observation router to use the pool")
    print(f"  3. Remove job submission from seed script")


if __name__ == "__main__":
    asyncio.run(main())
