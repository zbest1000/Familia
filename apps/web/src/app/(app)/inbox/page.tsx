"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Card, Heading, Text } from "@familia/ui-web";

import { api, clearSession, getAccessToken } from "@/lib/api";

type InboxItem = {
  alertId: string;
  type: string;
  topic: string;
  disclosureMode: string;
  sentAt: string | null;
  relationshipClass: string;
  messageVariantKey: string;
  renderedMessage: string;
  state: string;
  openedAt: string | null;
  acknowledgedAt: string | null;
};

export default function InboxPage() {
  const router = useRouter();
  const [items, setItems] = useState<InboxItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/signin");
      return;
    }
    void load();
  }, [router]);

  async function load() {
    try {
      const data = (await api.listAlertInbox()) as InboxItem[];
      setItems(data);
    } catch (err) {
      if ((err as { response?: { status?: number } } | undefined)?.response?.status === 401) {
        clearSession();
        router.replace("/signin");
      } else setError("Couldn't load your inbox.");
    }
  }

  async function onAck(id: string) {
    try {
      await api.acknowledgeAlert(id);
      await load();
    } catch {
      setError("Couldn't acknowledge.");
    }
  }

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Heading level={1}>Inbox</Heading>
        <Card className="mt-6">
          <Text emphasis="secondary">{error}</Text>
        </Card>
      </main>
    );
  }
  if (!items) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Heading level={1}>Inbox</Heading>
        <Text emphasis="secondary" className="mt-2">Loading…</Text>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-baseline justify-between">
        <Heading level={1}>Inbox</Heading>
        <a href="/home" className="text-xs text-zinc-500 underline">Home</a>
      </div>
      <Text emphasis="secondary" className="mt-2">
        Family health updates sent to you. Take what's useful, leave what isn't.
      </Text>

      {items.length === 0 ? (
        <Card className="mt-6">
          <Text emphasis="secondary">No alerts in your inbox.</Text>
        </Card>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((it) => (
            <Card key={it.alertId}>
              <div className="flex items-baseline justify-between">
                <Text>
                  <strong className="capitalize">{it.type.replace(/_/g, " ")}</strong>{" "}
                  <span className="text-zinc-500">— {it.topic}</span>
                </Text>
                <Text emphasis="tertiary" className="text-xs">
                  {it.sentAt ? new Date(it.sentAt).toLocaleString() : ""}
                </Text>
              </div>
              <Text className="mt-2">{it.renderedMessage}</Text>
              <Text emphasis="tertiary" className="mt-2 text-xs">
                Variant: <code>{it.messageVariantKey}</code> · status: {it.state}
              </Text>
              {it.state !== "acknowledged" ? (
                <button
                  onClick={() => void onAck(it.alertId)}
                  className="mt-3 rounded-md border border-zinc-300 px-3 py-1.5 text-xs dark:border-zinc-700"
                >
                  Mark as read
                </button>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
