import React from 'react';
import { useAdminLogger } from '@/hooks/use-admin-logger';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface Props {
  children: React.ReactNode;
}

export function AdminErrorBoundary({ children }: Props) {
  const { logActivity } = useAdminLogger();

  return (
    <ErrorBoundary
      boundaryName="admin_portal"
      title="Admin Panel Encountered an Issue"
      description="An unexpected error occurred in the administrative panel. The error has been logged for review."
      onError={(error, errorInfo) => {
        logActivity('ERROR', 'System', {
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
        });
      }}
      showHomeButton={true}
      showReloadButton={true}
      showTryAgainButton={true}
    >
      {children}
    </ErrorBoundary>
  );
}
