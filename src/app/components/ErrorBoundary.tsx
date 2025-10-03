'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="quest-card my-8 p-8 border-2 border-[#5a3f3f]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-[#e6e1f0]">💀 The Quest Has Failed</h2>
            <p className="text-[#bbb6c7] mb-6">
              A darkness has fallen upon this realm. The quest cannot proceed.
            </p>

            {this.state.error && (
              <details className="text-left mb-6 p-4 bg-[#1a1625] rounded-md">
                <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300">
                  View the ancient curse (error details)
                </summary>
                <pre className="mt-2 text-xs text-red-400 overflow-auto">
                  {this.state.error.toString()}
                  {'\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="quest-button"
            >
              ⚔️ Attempt Revival
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
