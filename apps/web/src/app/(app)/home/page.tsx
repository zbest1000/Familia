"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { Condition, Medication, User } from "@familia/domain";
import { Card, Heading, Text } from "@familia/ui-web";

import { api, clearSession, getAccessToken } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const [me, setMe] = useState<User | null>(null);
  const [meds, setMeds] = useState<Medication[] | null>(null);
  const [conditions, setConditions] = useState<Condition[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/signin");
      return;
    }
    void (async () => {
      try {
        const [user, mList, cList] = await Promise.all([
          api.me(),
          api.listMedications(),
          api.listConditions(),
        ]);
        setMe(user);
        setMeds(mList);
        setConditions(cList);
      } catch (err) {
        const status = (err as { response?: { status?: number } } | undefined)?.response?.status;
        if (status === 401) {
          clearSession();
          router.replace("/signin");
          return;
        }
        setError("We couldn't load your data right now. Try again in a moment.");
      }
    })();
  }, [router]);

  async function onSignout() {
    try {
      await api.signout();
    } catch {
      // best effort — even if API is unreachable we clear local state
    }
    clearSession();
    router.push("/signin");
  }

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Heading level={1}>Today</Heading>
        <Card className="mt-6">
          <Text emphasis="secondary">{error}</Text>
        </Card>
      </main>
    );
  }
  if (!me) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Heading level={1}>Today</Heading>
        <Text emphasis="secondary" className="mt-2">
          Loading…
        </Text>
      </main>
    );
  }

  const activeMeds = meds?.filter((m) => m.status === "active") ?? [];
  const activeConditions = conditions?.filter((c) => c.status === "active") ?? [];

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-baseline justify-between">
        <Heading level={1}>Hello, {me.firstName}</Heading>
        <button
          onClick={() => void onSignout()}
          className="text-xs text-zinc-500 underline"
        >
          Sign out
        </button>
      </div>
      <Text emphasis="secondary" className="mt-2">
        Welcome. Here&apos;s where today shows up.
      </Text>

      <nav className="mt-6 flex flex-wrap gap-2 text-sm">
        <a href="/health" className="rounded-md border border-zinc-300 px-3 py-1.5 dark:border-zinc-700">
          Health
        </a>
        <a href="/family" className="rounded-md border border-zinc-300 px-3 py-1.5 dark:border-zinc-700">
          Family
        </a>
        <a href="/inbox" className="rounded-md border border-zinc-300 px-3 py-1.5 dark:border-zinc-700">
          Inbox
        </a>
        <a href="/audit" className="rounded-md border border-zinc-300 px-3 py-1.5 dark:border-zinc-700">
          Audit log
        </a>
        <a href="/packet" className="rounded-md border border-zinc-300 px-3 py-1.5 dark:border-zinc-700">
          Doctor packet
        </a>
      </nav>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <Heading level={3}>Today&apos;s check-in</Heading>
          <Text emphasis="secondary" className="mt-1">
            Take 30 seconds to log how you feel today.
          </Text>
          <a
            href="/checkin"
            className="mt-3 inline-block rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Start a check-in
          </a>
        </Card>

        <Card>
          <Heading level={3}>Active medications ({activeMeds.length})</Heading>
          {activeMeds.length === 0 ? (
            <Text emphasis="secondary" className="mt-1">
              No active medications.{" "}
              <a className="underline" href="/health">
                Add one
              </a>
              .
            </Text>
          ) : (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {activeMeds.slice(0, 5).map((m) => (
                <li key={m.id}>
                  {m.name}
                  {m.doseText ? <span className="text-zinc-500"> · {m.doseText}</span> : null}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <Heading level={3}>Active conditions ({activeConditions.length})</Heading>
          {activeConditions.length === 0 ? (
            <Text emphasis="secondary" className="mt-1">
              No active conditions on file.{" "}
              <a className="underline" href="/health">
                Add one
              </a>
              .
            </Text>
          ) : (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {activeConditions.slice(0, 5).map((c) => (
                <li key={c.id}>{c.name}</li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <Heading level={3}>Family</Heading>
          <Text emphasis="secondary" className="mt-1">
            Your family. You decide who sees what.{" "}
            <a className="underline" href="/family">
              Open Family
            </a>
            .
          </Text>
        </Card>
      </div>
    </main>
  );
}
