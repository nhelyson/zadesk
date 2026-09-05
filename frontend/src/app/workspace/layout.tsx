import React from 'react';
import type { Metadata } from 'next';
import { WorkspaceProvider } from '@/components/workspace/WorkspaceContext';
import AppShell from '@/components/workspace/AppShell';

export const metadata: Metadata = {
  title: 'Workspace Entreprise | Zadesk SAV',
  description: "Interface de gestion SAV B2B, WhatsApp & IA d'entreprise Zadesk",
};

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
