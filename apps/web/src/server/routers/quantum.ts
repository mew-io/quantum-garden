import { router, publicProcedure } from "../trpc";

/**
 * Quantum service router - proxies requests to the Python quantum service.
 *
 * This router provides type-safe access to quantum service endpoints
 * for configuration, job stats, and execution mode visibility.
 */

const QUANTUM_SERVICE_URL = process.env.NEXT_PUBLIC_QUANTUM_SERVICE_URL || "http://localhost:18742";

interface QuantumConfig {
  execution_mode: "simulator" | "hardware" | "mock";
  ionq_api_key_configured: boolean;
  ionq_use_simulator: boolean;
  default_trait_qubits: number;
  default_shots: number;
  service_port: number;
  debug_mode: boolean;
}

interface JobStats {
  pending: number;
  submitted: number;
  running: number;
  completed: number;
  failed: number;
  timeout: number;
  total: number;
  execution_mode: string;
}

export const quantumRouter = router({
  /**
   * Get quantum service configuration.
   * Returns execution mode, IonQ settings, and circuit defaults.
   */
  getConfig: publicProcedure.query(async (): Promise<QuantumConfig | null> => {
    try {
      const res = await fetch(`${QUANTUM_SERVICE_URL}/config`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        console.error(`Quantum service /config returned ${res.status}`);
        return null;
      }

      return await res.json();
    } catch (error) {
      console.error("Failed to fetch quantum config:", error);
      return null;
    }
  }),

  /**
   * Get job queue statistics.
   * Returns counts of jobs in different states and execution mode.
   */
  getJobStats: publicProcedure.query(async (): Promise<JobStats | null> => {
    try {
      const res = await fetch(`${QUANTUM_SERVICE_URL}/jobs/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        console.error(`Quantum service /jobs/ returned ${res.status}`);
        return null;
      }

      return await res.json();
    } catch (error) {
      console.error("Failed to fetch job stats:", error);
      return null;
    }
  }),
});
