// components/ErrorBoundary.js
import React from "react";
import { BiRefresh, BiArrowBack, BiError } from "react-icons/bi";

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error("Error caught by ErrorBoundary:", {
      error: error.toString(),
      errorInfo: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    // Update state with error details
    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Send error to Sentry if available
    if (typeof window !== "undefined" && window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
        tags: {
          errorBoundary: true,
        },
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      const { fallback, showDetails = false } = this.props;

      // If custom fallback is provided, use it
      if (fallback) {
        return typeof fallback === "function"
          ? fallback(this.state.error, this.handleReset)
          : fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <BiError className="text-4xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">عذراً، حدث خطأ</h2>
                  <p className="text-red-100 mt-1">
                    Sorry, something went wrong
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                حدث خطأ غير متوقع أثناء تحميل هذه الصفحة. نعتذر عن الإزعاج. يرجى
                المحاولة مرة أخرى.
              </p>

              <p className="text-gray-600 mb-8">
                An unexpected error occurred while loading this page. We
                apologize for the inconvenience. Please try again.
              </p>

              {/* Error Details (Development Only) */}
              {(showDetails || process.env.NODE_ENV === "development") &&
                this.state.error && (
                  <details className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
                      Error Details (Development)
                    </summary>
                    <div className="mt-4 space-y-2">
                      <div className="text-sm">
                        <strong className="text-red-600">Error:</strong>
                        <pre className="mt-2 p-3 bg-red-50 rounded text-xs overflow-auto">
                          {this.state.error.toString()}
                        </pre>
                      </div>
                      {this.state.errorInfo && (
                        <div className="text-sm">
                          <strong className="text-red-600">
                            Component Stack:
                          </strong>
                          <pre className="mt-2 p-3 bg-red-50 rounded text-xs overflow-auto max-h-48">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={this.handleReload}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <BiRefresh className="text-xl" />
                  تحديث الصفحة / Reload Page
                </button>

                <button
                  onClick={this.handleGoBack}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  <BiArrowBack className="text-xl" />
                  الرجوع / Go Back
                </button>

                <button
                  onClick={this.handleReset}
                  className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-colors"
                >
                  Try Again
                </button>
              </div>

              {/* Error Count Warning */}
              {this.state.errorCount > 2 && (
                <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <p className="text-yellow-800 text-sm">
                    <strong>Note:</strong> This error has occurred{" "}
                    {this.state.errorCount} times. If the problem persists,
                    please contact support.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                إذا استمرت المشكلة، يرجى الاتصال بالدعم الفني
                <br />
                If the problem persists, please contact technical support
              </p>
            </div>
          </div>
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;

/**
 * Higher-order component to wrap any component with an error boundary
 * @param {React.Component} Component - Component to wrap
 * @param {Object} errorBoundaryProps - Props to pass to ErrorBoundary
 */
export function withErrorBoundary(Component, errorBoundaryProps = {}) {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name || "Component"
  })`;

  return WrappedComponent;
}

