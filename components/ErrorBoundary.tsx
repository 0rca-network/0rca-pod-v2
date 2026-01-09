'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-8">
            <AlertTriangle size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-4 font-outfit">
            SOMETHING WENT WRONG
          </h1>
          <p className="text-neutral-500 mb-8 max-w-md text-sm md:text-base">
            An unexpected error occurred while loading this page. Please try refreshing or contact support if the problem persists.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={this.handleRetry}
              className="px-6 py-3 bg-white text-black rounded-full font-bold text-sm uppercase tracking-widest hover:bg-mint-glow transition-all flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
            <button 
              onClick={() => window.location.href = '/agents'}
              className="px-6 py-3 bg-neutral-800 text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-neutral-700 transition-all"
            >
              Back to Directory
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-8 p-4 bg-neutral-900 rounded-lg text-left max-w-2xl w-full">
              <summary className="cursor-pointer text-red-400 font-bold mb-2">
                Error Details (Development Only)
              </summary>
              <pre className="text-xs text-neutral-400 overflow-auto">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}