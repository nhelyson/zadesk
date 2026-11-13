import React from 'react';
import { WorkspaceProvider } from '@/components/workspace/WorkspaceContext';
import { AppShell } from '@/components/workspace/AppShell';

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceProvider>
      <AppShell>{children}</AppShell>
    </WorkspaceProvider>
  );
}

