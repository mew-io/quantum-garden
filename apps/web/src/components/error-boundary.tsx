"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component for catching and handling React errors.
 *
 * Prevents the entire app from crashing when a component throws.
 * Displays a calm, minimal error message aligned with the garden's aesthetic.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error for debugging
    console.error("Garden error caught:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default minimal error display
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100vh",
            backgroundColor: "#1a1a2e",
            color: "#e8e8f0",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem", opacity: 0.6 }}>~</div>
            <p style={{ fontSize: "1rem", opacity: 0.8, marginBottom: "0.5rem" }}>
              The garden is resting
            </p>
            <p style={{ fontSize: "0.875rem", opacity: 0.5 }}>Please refresh to continue</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
