"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import type { Condition, Medication } from "@familia/domain";
import { Card, Heading, Text } from "@familia/ui-web";

import { api, clearSession, getAccessToken } from "@/lib/api";

export default function HealthPage() {
  const router = useRouter();
  const [meds, setMeds] = useState<Medication[] | null>(null);
  const [conditions, setConditions] = useState<Condition[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showAddMed, setShowAddMed] = useState(false);
  const [medName, setMedName] = useState("");
  const [medDoseText, setMedDoseText] = useState("");
  const [medFrequency, setMedFrequency] = useState("once daily");
  const [medReason, setMedReason] = useState("");

  const [showAddCondition, setShowAddCondition] = useState(false);
  const [condName, setCondName] = useState("");
  const [condSeverity, setCondSeverity] = useState<"mild" | "moderate" | "severe">("mild");

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/signin");
      return;
    }
    void refresh();
  }, [router]);

  async function refresh() {
    try {
      const [m, c] = await Promise.all([api.listMedications(), api.listConditions()]);
      setMeds(m);
      setConditions(c);
    } catch (err) {
      if ((err as { response?: { status?: number } } | undefined)?.response?.status === 401) {
        clearSession();
        router.replace("/signin");
      } else setError("Couldn't load your records.");
    }
  }

  async function onAddMed(e: FormEvent) {
    e.preventDefault();
    if (!medName.trim()) return;
    try {
      await api.addMedication({
        name: medName.trim(),
        doseText: medDoseText.trim() || undefined,
        frequencyText: medFrequency.trim() || undefined,
        reason: medReason.trim() || undefined,
        status: "active",
      } as Partial<Medication>);
      setMedName("");
      setMedDoseText("");
      setMedReason("");
      setShowAddMed(false);
      await refresh();
    } catch {
      setError("Couldn't add medication.");
    }
  }

  async function onAddCondition(e: FormEvent) {
    e.preventDefault();
    if (!condName.trim()) return;
    try {
      await api.addCondition({
        name: condName.trim(),
        severity: condSeverity,
        status: "active",
      } as Partial<Condition>);
      setCondName("");
      setShowAddCondition(false);
      await refresh();
    } catch {
      setError("Couldn't add condition.");
    }
  }

  async function onDeleteMed(id: string) {
    if (!confirm("Mark this medication as completed?")) return;
    try {
      await api.deleteMedication(id);
      await refresh();
    } catch {
      setError("Couldn't update medication.");
    }
  }

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Heading level={1}>Health</Heading>
        <Card className="mt-6">
          <Text emphasis="secondary">{error}</Text>
        </Card>
      </main>
    );
  }
  if (!meds || !conditions) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Heading level={1}>Health</Heading>
        <Text emphasis="secondary" className="mt-2">
          Loading…
        </Text>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-baseline justify-between">
        <Heading level={1}>Health</Heading>
        <a href="/home" className="text-xs text-zinc-500 underline">
          Home
        </a>
      </div>
      <Text emphasis="secondary" className="mt-2">
        Your conditions, medications, and records.
      </Text>

      {/* Medications */}
      <Card className="mt-6">
        <div className="flex items-center justify-between">
          <Heading level={3}>Medications ({meds.filter((m) => m.status === "active").length} active)</Heading>
          <button
            onClick={() => setShowAddMed(!showAddMed)}
            className="text-xs text-zinc-500 underline"
          >
            {showAddMed ? "Cancel" : "Add"}
          </button>
        </div>

        {showAddMed ? (
          <form onSubmit={onAddMed} className="mt-3 flex flex-col gap-2">
            <input
              placeholder="Name (e.g. Levothyroxine)"
              value={medName}
              onChange={(e) => setMedName(e.target.value)}
              required
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              placeholder="Dose (e.g. 50 mcg)"
              value={medDoseText}
              onChange={(e) => setMedDoseText(e.target.value)}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              placeholder="Frequency (e.g. once daily)"
              value={medFrequency}
              onChange={(e) => setMedFrequency(e.target.value)}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              placeholder="Why (e.g. Hashimoto's)"
              value={medReason}
              onChange={(e) => setMedReason(e.target.value)}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <button
              type="submit"
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Save
            </button>
          </form>
        ) : null}

        {meds.length === 0 ? (
          <Text emphasis="secondary" className="mt-2">
            No medications yet. Add what you take — including supplements and over-the-counter.
          </Text>
        ) : (
          <ul className="mt-3 space-y-1 text-sm">
            {meds.map((m) => (
              <li key={m.id} className="flex items-center justify-between">
                <span>
                  {m.name}
                  {m.doseText ? <span className="text-zinc-500"> · {m.doseText}</span> : null}
                  {m.status !== "active" ? (
                    <span className="ml-2 text-xs text-zinc-500">[{m.status}]</span>
                  ) : null}
                </span>
                {m.status === "active" ? (
                  <button
                    onClick={() => void onDeleteMed(m.id)}
                    className="text-xs text-zinc-500 underline"
                  >
                    Mark completed
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Conditions */}
      <Card className="mt-4">
        <div className="flex items-center justify-between">
          <Heading level={3}>Conditions ({conditions.filter((c) => c.status === "active").length} active)</Heading>
          <button
            onClick={() => setShowAddCondition(!showAddCondition)}
            className="text-xs text-zinc-500 underline"
          >
            {showAddCondition ? "Cancel" : "Add"}
          </button>
        </div>

        {showAddCondition ? (
          <form onSubmit={onAddCondition} className="mt-3 flex flex-col gap-2">
            <input
              placeholder="Name (e.g. Hashimoto's thyroiditis)"
              value={condName}
              onChange={(e) => setCondName(e.target.value)}
              required
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <select
              value={condSeverity}
              onChange={(e) => setCondSeverity(e.target.value as "mild" | "moderate" | "severe")}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
            <button
              type="submit"
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Save
            </button>
          </form>
        ) : null}

        {conditions.length === 0 ? (
          <Text emphasis="secondary" className="mt-2">
            No conditions yet. Add anything you've been diagnosed with — past or present.
          </Text>
        ) : (
          <ul className="mt-3 space-y-1 text-sm">
            {conditions.map((c) => (
              <li key={c.id}>
                {c.name}
                {c.severity ? <span className="text-zinc-500"> · {c.severity}</span> : null}
                {c.status !== "active" ? (
                  <span className="ml-2 text-xs text-zinc-500">[{c.status}]</span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </main>
  );
}
