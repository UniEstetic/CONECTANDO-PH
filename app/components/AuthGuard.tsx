'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile } from '@/app/lib/auth.service';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    getProfile().catch(() => {
      localStorage.removeItem('access_token');
      router.push('/');
    });
  }, []);

  return <>{children}</>;
}
