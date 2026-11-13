import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Espace Entreprise | Zadesk SAV',
  description: "Centre de pilotage SAV conversationnel, WhatsApp & IA d'entreprise Zadesk",
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
