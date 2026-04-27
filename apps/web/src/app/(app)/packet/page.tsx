"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Card, Heading, Text } from "@familia/ui-web";

import { api, getAccessToken } from "@/lib/api";

export default function PacketPage() {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [includeMedications, setIncludeMeds] = useState(true);
  const [includeConditions, setIncludeConditions] = useState(true);
  const [includeAllergies, setIncludeAllergies] = useState(true);
  const [includeRecentEncounters, setIncludeRecentEncounters] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (typeof window !== "undefined" && !getAccessToken()) {
    router.replace("/signin");
    return null;
  }

  async function onGenerate(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const blob = await api.generateDoctorPacket({
        reason: reason.trim() || undefined,
        includeMedications,
        includeConditions,
        includeAllergies,
        includeRecentEncounters,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `familia-packet-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("Couldn't generate the packet. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-baseline justify-between">
        <Heading level={1}>Doctor packet</Heading>
        <a href="/home" className="text-xs text-zinc-500 underline">Home</a>
      </div>
      <Text emphasis="secondary" className="mt-2">
        A one-page printable summary you can hand to a clinician. Built from your records.
      </Text>

      <Card className="mt-6">
        <form onSubmit={onGenerate} className="flex flex-col gap-3">
          <label className="text-sm font-medium" htmlFor="reason">
            Reason / specialty (optional)
          </label>
          <input
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Cardiology — follow-up"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />

          <Text className="mt-3 text-sm">Include sections:</Text>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={includeAllergies} onChange={(e) => setIncludeAllergies(e.target.checked)} />
            Allergies (clinically critical — recommend always)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={includeMedications} onChange={(e) => setIncludeMeds(e.target.checked)} />
            Active medications
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={includeConditions} onChange={(e) => setIncludeConditions(e.target.checked)} />
            Active conditions
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={includeRecentEncounters} onChange={(e) => setIncludeRecentEncounters(e.target.checked)} />
            Recent visits
          </label>

          {error ? (
            <Text emphasis="secondary" className="text-sm text-red-600">{error}</Text>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="mt-2 rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {busy ? "Generating…" : "Generate PDF"}
          </button>
        </form>

        <Text emphasis="tertiary" className="mt-4 text-xs">
          Each generation is logged in your audit trail.
        </Text>
      </Card>
    </main>
  );
}
