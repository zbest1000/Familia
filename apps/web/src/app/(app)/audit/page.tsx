"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Card, Heading, Text } from "@familia/ui-web";

import { api, clearSession, getAccessToken } from "@/lib/api";

type AuditItem = Awaited<ReturnType<typeof api.listAudit>>["items"][number];

export default function AuditPage() {
  const router = useRouter();
  const [scope, setScope] = useState<"mine" | "by_me">("mine");
  const [items, setItems] = useState<AuditItem[] | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/signin");
      return;
    }
    setItems(null);
    setCursor(null);
    void load(undefined, scope);
  }, [scope, router]);

  async function load(c: string | undefined, s: "mine" | "by_me") {
    setBusy(true);
    try {
      const res = await api.listAudit({ scope: s, ...(c ? { cursor: c } : {}), limit: 50 });
      setItems((prev) => (prev && c ? [...prev, ...res.items] : res.items));
      setCursor(res.nextCursor);
      setHasMore(Boolean(res.nextCursor));
    } catch (err) {
      if ((err as { response?: { status?: number } } | undefined)?.response?.status === 401) {
        clearSession();
        router.replace("/signin");
      } else setError("Couldn't load audit log.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-baseline justify-between">
        <Heading level={1}>Audit log</Heading>
        <a href="/home" className="text-xs text-zinc-500 underline">
          Home
        </a>
      </div>
      <Text emphasis="secondary" className="mt-2">
        Every read of your data, every share, every change. Nothing is hidden.
      </Text>

      <div className="mt-4 flex gap-2 text-sm">
        <button
          onClick={() => setScope("mine")}
          className={`rounded-md px-3 py-1.5 ${
            scope === "mine"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "border border-zinc-300 dark:border-zinc-700"
          }`}
        >
          About my data (privacy view)
        </button>
        <button
          onClick={() => setScope("by_me")}
          className={`rounded-md px-3 py-1.5 ${
            scope === "by_me"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "border border-zinc-300 dark:border-zinc-700"
          }`}
        >
          What I did (transparency view)
        </button>
      </div>

      {error ? (
        <Card className="mt-6">
          <Text emphasis="secondary">{error}</Text>
        </Card>
      ) : !items ? (
        <Text emphasis="secondary" className="mt-6">
          Loading…
        </Text>
      ) : items.length === 0 ? (
        <Card className="mt-6">
          <Text emphasis="secondary">No activity yet.</Text>
        </Card>
      ) : (
        <Card className="mt-6">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
              <tr>
                <th className="py-2 pr-3">When</th>
                <th className="py-2 pr-3">Event</th>
                <th className="py-2 pr-3">Transition</th>
                <th className="py-2 pr-3">Subject</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.eventId} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 pr-3 align-top text-xs text-zinc-500">
                    {new Date(it.createdAt).toLocaleString()}
                  </td>
                  <td className="py-2 pr-3 align-top font-mono text-xs">{it.eventType}</td>
                  <td className="py-2 pr-3 align-top text-xs text-zinc-500">
                    {it.fromState ?? "—"} → {it.toState ?? "—"}
                  </td>
                  <td className="py-2 pr-3 align-top font-mono text-xs text-zinc-500">
                    {it.subjectId.slice(0, 8)}…
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {hasMore ? (
            <button
              disabled={busy}
              onClick={() => void load(cursor ?? undefined, scope)}
              className="mt-3 w-full rounded-md border border-zinc-300 px-3 py-2 text-xs disabled:opacity-50 dark:border-zinc-700"
            >
              {busy ? "Loading…" : "Load more"}
            </button>
          ) : null}
        </Card>
      )}
    </main>
  );
}
