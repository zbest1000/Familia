"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Card, Heading, Text } from "@familia/ui-web";

import { api, setSession } from "@/lib/api";

type Mode = "email" | "code";

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmitEmail(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await api.startSignin(email);
      setChallengeId(res.challengeId);
      setMode("code");
    } catch (err) {
      setError("We couldn't start sign-in. Try again.");
      console.error(err);
    } finally {
      setBusy(false);
    }
  }

  async function onSubmitCode(e: FormEvent) {
    e.preventDefault();
    if (!challengeId) return;
    setError(null);
    setBusy(true);
    try {
      const res = await api.verifySignin({ challengeId, code });
      setSession({
        userId: res.userId,
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
      });
      router.push("/home");
    } catch {
      setError("That code didn't work. Try again, or request a new one.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <Heading level={1}>Welcome back</Heading>
      <Text emphasis="secondary" className="mt-2">
        Enter the email you used to sign up. We&apos;ll send a one-time code.
      </Text>

      <Card className="mt-8">
        {mode === "email" ? (
          <form onSubmit={onSubmitEmail} className="flex flex-col gap-3">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <button
              type="submit"
              disabled={busy}
              className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              {busy ? "Sending…" : "Send code"}
            </button>
          </form>
        ) : (
          <form onSubmit={onSubmitCode} className="flex flex-col gap-3">
            <label htmlFor="code" className="text-sm font-medium">
              6-digit code sent to {email}
            </label>
            <input
              id="code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-center text-lg tracking-widest dark:border-zinc-700 dark:bg-zinc-900"
            />
            <button
              type="submit"
              disabled={busy || code.length !== 6}
              className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              {busy ? "Verifying…" : "Verify and sign in"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("email");
                setCode("");
                setChallengeId(null);
              }}
              className="mt-1 text-xs text-zinc-500 underline"
            >
              Use a different email
            </button>
          </form>
        )}

        {error ? (
          <Text emphasis="secondary" className="mt-3 text-sm text-red-600">
            {error}
          </Text>
        ) : null}
      </Card>

      <Text emphasis="tertiary" className="mt-6 text-center text-xs">
        New here? Sign-up uses the same flow — your code lands in the API
        log in dev.
      </Text>
    </main>
  );
}
