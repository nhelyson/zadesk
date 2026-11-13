'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WorkspaceAgentsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/app/agents');
  }, [router]);

  return (
    <div className="p-8 text-center text-slate-500 text-xs">
      Redirection vers l&apos;équipe SAV...
    </div>
  );
}
