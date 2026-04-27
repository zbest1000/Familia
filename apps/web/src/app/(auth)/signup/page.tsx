"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Card, Heading, Text } from "@familia/ui-web";

import { api, setSession } from "@/lib/api";

type Mode = "details" | "code";

export default function SignUpPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("details");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [code, setCode] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onStart(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await api.startSignup(email);
      setChallengeId(res.challengeId);
      setMode("code");
    } catch {
      setError("Couldn't start signup. Check the email and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function onVerify(e: FormEvent) {
    e.preventDefault();
    if (!challengeId) return;
    setError(null);
    setBusy(true);
    try {
      const tz =
        typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC";
      const res = await api.verifySignup({
        challengeId,
        code,
        firstName,
        lastName: lastName || undefined,
        dateOfBirth: dateOfBirth || undefined,
        timezone: tz,
      });
      setSession({
        userId: res.userId,
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
      });
      router.push("/home");
    } catch {
      setError("That code didn't work, or an account with that email already exists.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <Heading level={1}>Create your account</Heading>
      <Text emphasis="secondary" className="mt-2">
        Three things we promise: your data is encrypted and only you decide who sees it; we will
        never sell or share without your consent; you can export or delete everything, anytime.
      </Text>

      <Card className="mt-8">
        {mode === "details" ? (
          <form onSubmit={onStart} className="flex flex-col gap-3">
            <label className="text-sm font-medium" htmlFor="firstName">
              First name
            </label>
            <input
              id="firstName"
              required
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <label className="text-sm font-medium" htmlFor="lastName">
              Last name <span className="font-normal text-zinc-500">(optional)</span>
            </label>
            <input
              id="lastName"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <label className="text-sm font-medium" htmlFor="dob">
              Date of birth <span className="font-normal text-zinc-500">(optional)</span>
            </label>
            <input
              id="dob"
              type="date"
              autoComplete="bday"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              inputMode="email"
              autoComplete="email"
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
          <form onSubmit={onVerify} className="flex flex-col gap-3">
            <label className="text-sm font-medium" htmlFor="code">
              6-digit code sent to {email}
            </label>
            <input
              id="code"
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
              {busy ? "Verifying…" : "Verify and create account"}
            </button>
          </form>
        )}

        {error ? (
          <Text emphasis="secondary" className="mt-3 text-sm text-red-600">
            {error}
          </Text>
        ) : null}

        <Text emphasis="tertiary" className="mt-4 text-xs">
          Already have an account?{" "}
          <a href="/signin" className="underline">
            Sign in
          </a>
          .
        </Text>
      </Card>
    </main>
  );
}
