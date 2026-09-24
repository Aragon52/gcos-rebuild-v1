import React, { Component, ErrorInfo, ReactNode, useState } from "react";
import {
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Home,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { reportLovableError } from "@/lib/lovable-error-reporting";

export interface ErrorBoundaryFallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  reset: () => void;
}

export interface ErrorFallbackViewProps {
  error: Error;
  errorInfo?: ErrorInfo | null;
  reset?: () => void;
  title?: string;
  description?: string;
  showTryAgainButton?: boolean;
  showReloadButton?: boolean;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  fullScreen?: boolean;
  boundaryName?: string;
}

export function ErrorFallbackView({
  error,
  errorInfo = null,
  reset,
  title = "Something went wrong",
  description = "An unexpected error occurred while displaying this section. Your session and data are secure.",
  showTryAgainButton = true,
  showReloadButton = true,
  showHomeButton = true,
  showBackButton = false,
  fullScreen = true,
  boundaryName = "app_error_boundary",
}: ErrorFallbackViewProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      handleGoHome();
    }
  };

  const handleCopyError = async () => {
    const errorDetails = [
      `Timestamp: ${new Date().toISOString()}`,
      `URL: ${typeof window !== "undefined" ? window.location.href : "SSR"}`,
      `Boundary: ${boundaryName}`,
      `Error: ${error?.name || "Error"}: ${error?.message || "Unknown error"}`,
      "",
      "--- Stack Trace ---",
      error?.stack || "No stack trace available",
      "",
      "--- Component Stack ---",
      errorInfo?.componentStack || "No component stack trace available",
    ].join("\n");

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(errorDetails);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        return;
      }
    } catch {
      // Fallback below
    }

    try {
      const textarea = document.createElement("textarea");
      textarea.value = errorDetails;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignore copy error
    }
  };

  const containerClass = fullScreen
    ? "min-h-[80vh] w-full flex items-center justify-center p-4 sm:p-6"
    : "w-full py-8 px-4 flex items-center justify-center";

  return (
    <div id={`error-fallback-${boundaryName}`} className={containerClass}>
      <div className="w-full max-w-xl bg-card text-card-foreground rounded-2xl border border-border shadow-sm p-6 sm:p-8 transition-all">
        {/* Header Icon & Title */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0 border border-destructive/20">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Error summary badge */}
        <div className="mt-5 p-3.5 rounded-xl bg-muted/60 border border-border/80 text-xs font-mono text-muted-foreground break-words flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0 text-muted-foreground/70 mt-0.5" />
          <div className="flex-1 overflow-hidden">
            <span className="font-semibold text-foreground/90">
              {error.name || "Runtime Error"}:
            </span>{" "}
            {error.message || "An unspecified application error was encountered."}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          {showTryAgainButton && reset && (
            <Button
              id="error-boundary-retry-btn"
              variant="default"
              onClick={reset}
              className="gap-2 font-medium"
            >
              <RotateCcw className="h-4 w-4" />
              Try Again
            </Button>
          )}

          {showReloadButton && (
            <Button
              id="error-boundary-reload-btn"
              variant="outline"
              onClick={handleReload}
              className="gap-2 font-medium"
            >
              <RefreshCw className="h-4 w-4" />
              Reload Page
            </Button>
          )}

          {showHomeButton && (
            <Button
              id="error-boundary-home-btn"
              variant="ghost"
              onClick={handleGoHome}
              className="gap-2 font-medium text-muted-foreground hover:text-foreground"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          )}

          {showBackButton && (
            <Button
              id="error-boundary-back-btn"
              variant="ghost"
              onClick={handleGoBack}
              className="gap-2 font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          )}
        </div>

        {/* Technical details toggle */}
        <div className="mt-6 pt-5 border-t border-border/60">
          <div className="flex items-center justify-between">
            <button
              id="error-boundary-toggle-details-btn"
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  Hide Technical Details
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  Show Technical Details
                </>
              )}
            </button>

            {showDetails && (
              <Button
                id="error-boundary-copy-btn"
                variant="ghost"
                size="sm"
                onClick={handleCopyError}
                className="h-7 px-2.5 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy Error
                  </>
                )}
              </Button>
            )}
          </div>

          {showDetails && (
            <div className="mt-3 space-y-3">
              {error.stack && (
                <div>
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Stack Trace
                  </div>
                  <pre className="max-h-48 overflow-auto p-3 rounded-lg bg-muted text-[11px] font-mono text-muted-foreground leading-relaxed border border-border select-text">
                    {error.stack}
                  </pre>
                </div>
              )}

              {errorInfo?.componentStack && (
                <div>
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Component Stack
                  </div>
                  <pre className="max-h-40 overflow-auto p-3 rounded-lg bg-muted text-[11px] font-mono text-muted-foreground leading-relaxed border border-border select-text">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode | ((props: ErrorBoundaryFallbackProps) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: unknown[];
  title?: string;
  description?: string;
  showHomeButton?: boolean;
  showReloadButton?: boolean;
  showBackButton?: boolean;
  showTryAgainButton?: boolean;
  fullScreen?: boolean;
  boundaryName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static defaultProps: Partial<ErrorBoundaryProps> = {
    fullScreen: true,
    showTryAgainButton: true,
    showReloadButton: true,
    showHomeButton: true,
    showBackButton: false,
    boundaryName: "app_error_boundary",
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // 1. Report to Lovable runtime error listener & analytics
    try {
      reportLovableError(error, {
        boundary: this.props.boundaryName || "app_error_boundary",
        componentStack: errorInfo?.componentStack,
      });
    } catch {
      // Ignore reporting errors to prevent cascading failures
    }

    // 2. Notify optional external callback
    try {
      this.props.onError?.(error, errorInfo);
    } catch (cbError) {
      console.error("Error in ErrorBoundary onError callback:", cbError);
    }

    // 3. Clear, structured console log
    console.group(`[ErrorBoundary: ${this.props.boundaryName || "Default"}]`);
    console.error("Caught error:", error);
    if (errorInfo?.componentStack) {
      console.error("Component stack trace:", errorInfo.componentStack);
    }
    console.groupEnd();
  }

  public componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // If resetKeys change while in error state, automatically attempt to recover
    if (this.state.hasError && this.props.resetKeys && prevProps.resetKeys) {
      const hasChanged = this.props.resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );
      if (hasChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  public resetErrorBoundary = () => {
    try {
      this.props.onReset?.();
    } catch (err) {
      console.error("Error in ErrorBoundary onReset callback:", err);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render() {
    const { hasError, error, errorInfo } = this.state;
    const {
      fallback,
      children,
      title = "Something went wrong",
      description = "An unexpected error occurred while displaying this section. Your session and data are secure.",
      showTryAgainButton = true,
      showReloadButton = true,
      showHomeButton = true,
      showBackButton = false,
      fullScreen = true,
      boundaryName = "app_error_boundary",
    } = this.props;

    if (hasError && error) {
      if (typeof fallback === "function") {
        return fallback({
          error,
          errorInfo,
          reset: this.resetErrorBoundary,
        });
      }

      if (fallback) {
        return fallback;
      }

      return (
        <ErrorFallbackView
          error={error}
          errorInfo={errorInfo}
          reset={this.resetErrorBoundary}
          title={title}
          description={description}
          showTryAgainButton={showTryAgainButton}
          showReloadButton={showReloadButton}
          showHomeButton={showHomeButton}
          showBackButton={showBackButton}
          fullScreen={fullScreen}
          boundaryName={boundaryName}
        />
      );
    }

    return children;
  }
}

/**
 * Higher-Order Component to wrap any component with an ErrorBoundary.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: ErrorBoundaryProps
) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || "Component";

  const ComponentWithErrorBoundary = (props: P) => (
    <ErrorBoundary boundaryName={displayName} {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;
  return ComponentWithErrorBoundary;
}

export default ErrorBoundary;
