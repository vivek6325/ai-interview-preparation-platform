import React from 'react';

/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in child component trees and displays fallback recovery UI.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('⚠️ [ErrorBoundary] Caught unhandled rendering exception:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-5 text-center text-light">
          <div className="card bg-dark border border-danger border-opacity-50 p-5 rounded-4 shadow-lg mx-auto" style={{ maxWidth: '600px' }}>
            <div className="fs-1 mb-3">⚡</div>
            <h1 className="h3 fw-bold text-danger mb-2">Something went wrong</h1>
            <p className="text-secondary fs-7 mb-4">
              An unexpected application error occurred while rendering this view. Don't worry, your data is safe.
            </p>

            <div className="d-flex justify-content-center gap-3">
              <button
                type="button"
                className="btn btn-outline-secondary px-4"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
              <button
                type="button"
                className="btn btn-primary px-4 fw-bold"
                onClick={this.handleReset}
              >
                Go to Dashboard →
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
