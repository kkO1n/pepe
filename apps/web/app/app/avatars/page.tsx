'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiFetch } from '@/lib/api/client';
import { getErrorMessage } from '@/lib/hooks/use-api-error';
import type { AvatarItem } from '@/types/avatars';

export const dynamic = 'force-dynamic';

export default function AvatarsPage() {
  const [avatars, setAvatars] = useState<AvatarItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAvatars = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch<AvatarItem[]>('/avatars/me', {
        method: 'GET',
      });
      setAvatars(response);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to fetch avatars'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAvatars();
  }, [fetchAvatars]);

  const onUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    setFeedback(null);

    try {
      const payload = new FormData();
      payload.append('file', selectedFile);

      await apiFetch('/avatars/upload', {
        method: 'POST',
        body: payload,
      });

      setSelectedFile(null);
      setFeedback('Avatar uploaded.');
      await fetchAvatars();
    } catch (uploadError) {
      setError(getErrorMessage(uploadError, 'Upload failed'));
    } finally {
      setIsUploading(false);
    }
  };

  const onDelete = async (avatarId: number) => {
    setDeletingId(avatarId);
    setError(null);
    setFeedback(null);

    try {
      await apiFetch(`/avatars/${avatarId}`, {
        method: 'DELETE',
      });

      setFeedback('Avatar deleted.');
      await fetchAvatars();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, 'Delete failed'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Upload avatar</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
            onSubmit={(event) => {
              void onUpload(event);
            }}
          >
            <Input
              accept="image/png,image/jpeg"
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            />
            <Button disabled={!selectedFile || isUploading} type="submit">
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </form>
          {feedback ? (
            <p className="mt-3 text-sm text-primary">{feedback}</p>
          ) : null}
          {error ? (
            <p className="mt-3 text-sm text-destructive">{error}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My avatars</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading avatars...</p>
          ) : null}
          {!isLoading && avatars.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No avatars uploaded yet.
            </p>
          ) : null}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {avatars.map((avatar) => (
              <article
                className="space-y-2 rounded-lg border border-border/70 bg-muted/20 p-3"
                key={avatar.avatarId}
              >
                <div className="relative h-44 w-full overflow-hidden rounded-md bg-muted">
                  <Image
                    alt={`Avatar ${avatar.avatarId}`}
                    className="object-cover"
                    fill
                    src={avatar.path}
                    unoptimized
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Uploaded:{' '}
                  {avatar.createdAt
                    ? new Date(avatar.createdAt).toLocaleString()
                    : 'N/A'}
                </p>
                <Button
                  disabled={deletingId === avatar.avatarId}
                  onClick={() => void onDelete(avatar.avatarId)}
                  size="sm"
                  variant="destructive"
                >
                  {deletingId === avatar.avatarId ? 'Deleting...' : 'Delete'}
                </Button>
              </article>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
