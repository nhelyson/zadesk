'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function InvitationsRedirect() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  useEffect(() => {
    if (token) {
      router.replace(`/invite/${token}`);
    } else {
      router.replace('/login');
    }
  }, [token, router]);

  return null;
}

