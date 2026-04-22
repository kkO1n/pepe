'use client';

import { useState, type FormEvent } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api/client';
import { getErrorMessage } from '@/lib/hooks/use-api-error';

export const dynamic = 'force-dynamic';

export default function AppOverviewPage() {
  const { user, refreshProfile } = useAuth();

  const [recipientId, setRecipientId] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitTransfer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFeedback(null);

    const normalizedAmount = amount.trim().replace(',', '.');
    if (!/^\d+(\.\d{1,2})?$/.test(normalizedAmount)) {
      setError('Amount must be a positive number with up to 2 decimals.');
      return;
    }

    setIsSubmitting(true);

    try {
      await apiFetch<void>('/users/me/transfers', {
        method: 'POST',
        body: JSON.stringify({
          recipientId: Number(recipientId),
          amount: normalizedAmount,
        }),
      });

      await refreshProfile();
      setFeedback('Transfer submitted successfully.');
      setRecipientId('');
      setAmount('');
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Transfer failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Data returned by `GET /users/me`.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Login:</strong> {user?.login}
          </p>
          <p>
            <strong>Email:</strong> {user?.email}
          </p>
          <p>
            <strong>Age:</strong> {user?.age}
          </p>
          <p>
            <strong>Balance:</strong> {user?.balance}
          </p>
          <p>
            <strong>Description:</strong> {user?.description}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transfer</CardTitle>
          <CardDescription>
            Send funds via `POST /users/me/transfers`.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-3"
            onSubmit={(event) => {
              void submitTransfer(event);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="recipientId">Recipient ID</Label>
              <Input
                id="recipientId"
                min={1}
                type="number"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                inputMode="decimal"
                placeholder="10.50"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            {feedback ? (
              <p className="text-sm text-primary">{feedback}</p>
            ) : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Submitting...' : 'Send transfer'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
