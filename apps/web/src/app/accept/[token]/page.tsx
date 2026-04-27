"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Card, Heading, Text } from "@familia/ui-web";

import { api, getAccessToken } from "@/lib/api";

type Preview = {
  id: string;
  state: string;
  proposedRelationship: string;
  proposedBiologicalLink: boolean;
  proposedPreset: string;
  proposedReciprocalPreset: string | null;
  expiresAt: string;
};

export default function AcceptInvitePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params.token;

  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<"accepted" | "declined" | null>(null);

  useEffect(() => {
    if (!token) return;
    void (async () => {
      try {
        const p = (await api.previewInvite(token)) as Preview;
        setPreview(p);
      } catch {
        setError("This link isn't valid anymore. Ask the sender for a new one.");
      }
    })();
  }, [token]);

  async function ensureSignedInThen(action: "accept" | "decline") {
    if (!getAccessToken()) {
      const here = `/accept/${token}`;
      router.push(`/signin?next=${encodeURIComponent(here)}`);
      return;
    }
    setBusy(true);
    try {
      if (action === "accept") {
        await api.acceptInvite(token);
        setDone("accepted");
      } else {
        await api.declineInvite(token);
        setDone("declined");
      }
    } catch {
      setError("We couldn't complete that. Try again, or ask the sender for a new link.");
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <Heading level={1}>Invite</Heading>
        <Card className="mt-6">
          <Text emphasis="secondary">{error}</Text>
        </Card>
      </main>
    );
  }
  if (done) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <Heading level={1}>{done === "accepted" ? "Connected" : "Declined"}</Heading>
        <Card className="mt-6">
          <Text emphasis="secondary">
            {done === "accepted"
              ? "You're now connected. You can manage what you share with them any time from Family."
              : "No worries. We've let them know without saying why."}
          </Text>
          <button
            onClick={() => router.push("/home")}
            className="mt-4 rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Go home
          </button>
        </Card>
      </main>
    );
  }
  if (!preview) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <Heading level={1}>Invite</Heading>
        <Text emphasis="secondary" className="mt-2">
          Loading…
        </Text>
      </main>
    );
  }

  const presetCopy: Record<string, string> = {
    none: "No data shared by default",
    emergency: "Emergency profile (allergies, current meds, major conditions, blood type, contacts)",
    care_bundle:
      "Care bundle (everything in Emergency plus visits, labs, immunizations, dental, vision, weekly wearable summaries)",
    full_record: "Full record (everything except mental health, HRT, and other highly sensitive entries)",
    custom: "Custom — they pick exactly what to share",
  };

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <Heading level={1}>You've been invited</Heading>
      <Text emphasis="secondary" className="mt-2">
        Someone wants to connect with you on FAMILIA.
      </Text>

      <Card className="mt-6">
        <Text>
          They'd like to be your <strong>{preview.proposedRelationship.replace(/_/g, " ")}</strong>
          {preview.proposedBiologicalLink ? " (biological link)" : ""}.
        </Text>
        <Text emphasis="secondary" className="mt-3 text-sm">
          They're proposing to share with you:
        </Text>
        <Text className="mt-1 text-sm">{presetCopy[preview.proposedPreset] ?? preview.proposedPreset}</Text>
        {preview.proposedReciprocalPreset && preview.proposedReciprocalPreset !== "none" ? (
          <>
            <Text emphasis="secondary" className="mt-3 text-sm">
              They're asking you to share back:
            </Text>
            <Text className="mt-1 text-sm">
              {presetCopy[preview.proposedReciprocalPreset] ?? preview.proposedReciprocalPreset}
            </Text>
          </>
        ) : null}
        <Text emphasis="tertiary" className="mt-3 text-xs">
          You're in control. You can change or revoke any sharing later from Family settings. This
          link expires {new Date(preview.expiresAt).toLocaleString()}.
        </Text>

        <div className="mt-5 flex gap-2">
          <button
            disabled={busy}
            onClick={() => void ensureSignedInThen("accept")}
            className="flex-1 rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {busy ? "Working…" : "Accept and connect"}
          </button>
          <button
            disabled={busy}
            onClick={() => void ensureSignedInThen("decline")}
            className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold disabled:opacity-50 dark:border-zinc-700"
          >
            Not now
          </button>
        </div>
      </Card>

      {!getAccessToken() ? (
        <Text emphasis="tertiary" className="mt-4 text-center text-xs">
          You'll need to sign in or sign up first. We'll bring you back here.
        </Text>
      ) : null}
    </main>
  );
}
