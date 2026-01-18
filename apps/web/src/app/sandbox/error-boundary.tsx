"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface SandboxErrorBoundaryProps {
  children: ReactNode;
}

interface SandboxErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for the sandbox page.
 *
 * Provides a developer-friendly error display for the variant sandbox.
 */
export class SandboxErrorBoundary extends Component<
  SandboxErrorBoundaryProps,
  SandboxErrorBoundaryState
> {
  constructor(props: SandboxErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): SandboxErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Sandbox error:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100vh",
            backgroundColor: "#1e1e2e",
            color: "#cdd6f4",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ textAlign: "center", padding: "2rem", maxWidth: "600px" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Sandbox Error</h2>
            <p style={{ fontSize: "0.875rem", opacity: 0.7, marginBottom: "1rem" }}>
              {this.state.error?.message ?? "An unexpected error occurred"}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#45475a",
                color: "#cdd6f4",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
