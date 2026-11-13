"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Legacy CreateWorkspaceModal - Neutralized.
 * All workspace creation routes through the unified official /app/onboarding experience.
 */
export const CreateWorkspaceModal = () => {
  const router = useRouter();
  useEffect(() => {
    router.replace("/app/onboarding");
  }, [router]);

  return null;
};

export default CreateWorkspaceModal;
