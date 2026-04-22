'use client';

import { X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { getAccessToken } from '@/lib/api/client';
import type { NotificationPayload } from '@/types/notifications';

type ToastItem = {
  id: string;
  payload: NotificationPayload;
};

const MAX_TOASTS = 4;
const AUTO_DISMISS_MS = 6000;

function getNotificationOrigin(): string {
  if (process.env.NEXT_PUBLIC_NOTIFICATION_ORIGIN) {
    return process.env.NEXT_PUBLIC_NOTIFICATION_ORIGIN;
  }

  if (process.env.NEXT_PUBLIC_BACKEND_ORIGIN) {
    return process.env.NEXT_PUBLIC_BACKEND_ORIGIN;
  }

  return 'http://127.0.0.1:3001';
}

function formatMessage(payload: NotificationPayload): string {
  if (
    payload.type === 'transfer_completed' &&
    typeof payload.amount === 'number'
  ) {
    return `Transfer received: ${payload.amount.toFixed(2)}`;
  }

  return payload.message;
}

export function NotificationToasts() {
  const { user, isBootstrapping } = useAuth();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const origin = useMemo(() => getNotificationOrigin(), []);

  useEffect(() => {
    if (isBootstrapping || !user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const token = getAccessToken();

    if (!token) {
      return;
    }

    const socket = io(origin, {
      path: '/notifications/socket.io',
      transports: ['websocket'],
      auth: {
        token,
      },
    });

    socket.on('notification', (payload: NotificationPayload) => {
      setToasts((current) => {
        const next = [
          {
            id: crypto.randomUUID(),
            payload,
          },
          ...current,
        ];

        return next.slice(0, MAX_TOASTS);
      });
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isBootstrapping, origin, user]);

  useEffect(() => {
    if (toasts.length === 0) return;

    const timeout = setTimeout(() => {
      setToasts((current) => current.slice(0, -1));
    }, AUTO_DISMISS_MS);

    return () => {
      clearTimeout(timeout);
    };
  }, [toasts]);

  if (!user || toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(92vw,22rem)] flex-col gap-2">
      {toasts.map((toast) => (
        <article
          className="pointer-events-auto rounded-lg border border-border bg-card p-3 shadow-lg"
          key={toast.id}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">Notification</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatMessage(toast.payload)}
              </p>
            </div>
            <Button
              className="h-7 w-7 p-0"
              onClick={() => {
                setToasts((current) =>
                  current.filter((item) => item.id !== toast.id),
                );
              }}
              size="sm"
              variant="ghost"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
