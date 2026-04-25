import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    localStorage.removeItem('revelstreet:query-cache');
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-surface p-8 text-center">
          <p className="text-xl font-semibold text-content">Something went wrong</p>
          <p className="max-w-sm text-sm text-content-muted">
            {this.state.error.message}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Reset and reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
