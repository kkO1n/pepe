'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';

export const dynamic = 'force-dynamic';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isBootstrapping } = useAuth();

  useEffect(() => {
    if (!isBootstrapping && user) {
      router.replace('/app');
    }
  }, [isBootstrapping, router, user]);

  return (
    <div className="grid min-h-screen place-items-center px-4 py-8">
      {children}
    </div>
  );
}
