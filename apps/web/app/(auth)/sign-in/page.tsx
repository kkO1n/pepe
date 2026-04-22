'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState, type FormEvent } from 'react';
import { AuthCard } from '@/components/auth/auth-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getErrorMessage } from '@/lib/hooks/use-api-error';
import { useAuth } from '@/components/auth/auth-provider';

export const dynamic = 'force-dynamic';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();

  const next = useMemo(
    () => searchParams.get('next') ?? '/app',
    [searchParams],
  );
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await signIn({ login, password });
      router.replace(next);
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Unable to sign in'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Sign in"
      description="Use your Pepe credentials to continue."
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="login">Login</Label>
          <Input
            id="login"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
      <p className="mt-4 text-sm text-muted-foreground">
        New here?{' '}
        <Link className="font-medium text-primary" href="/sign-up">
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}
