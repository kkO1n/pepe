'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { AppShell } from '@/components/layout/app-shell';
import { NotificationToasts } from '@/components/notifications/notification-toasts';

export const dynamic = 'force-dynamic';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isBootstrapping } = useAuth();

  useEffect(() => {
    if (!isBootstrapping && !user) {
      router.replace(`/sign-in?next=${encodeURIComponent(pathname)}`);
    }
  }, [isBootstrapping, pathname, router, user]);

  if (isBootstrapping) {
    return (
      <div className="grid min-h-screen place-items-center">
        <p className="text-sm text-muted-foreground">Restoring session...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <AppShell>{children}</AppShell>
      <NotificationToasts />
    </>
  );
}
