"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Card, Heading, Text } from "@familia/ui-web";

import { api, getAccessToken } from "@/lib/api";

const SYMPTOM_CHIPS = [
  "headache",
  "nausea",
  "fatigue",
  "anxious",
  "low mood",
  "joint pain",
  "back pain",
  "insomnia",
  "dizziness",
  "shortness of breath",
];

function Slider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <Text className="text-sm">{label}</Text>
        <Text className="text-sm" emphasis="secondary">
          {value}/10
        </Text>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number.parseInt(e.target.value, 10))}
        className="w-full"
      />
    </div>
  );
}

export default function CheckInPage() {
  const router = useRouter();
  const [physical, setPhysical] = useState(6);
  const [mental, setMental] = useState(6);
  const [energy, setEnergy] = useState(6);
  const [pain, setPain] = useState(2);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [freeText, setFreeText] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (typeof window !== "undefined" && !getAccessToken()) {
    router.replace("/signin");
    return null;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.submitCheckIn({
        cadence: "daily",
        physical,
        mental,
        energy,
        pain,
        symptoms,
        freeText: freeText.trim() || undefined,
      });
      setDone(true);
    } catch {
      setError("Couldn't save. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  function toggleSymptom(s: string) {
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  if (done) {
    return (
      <main className="mx-auto max-w-md px-4 py-12">
        <Heading level={1}>Saved</Heading>
        <Card className="mt-6">
          <Text emphasis="secondary">
            Logged. We'll surface patterns in your next weekly summary.
          </Text>
          <a
            href="/home"
            className="mt-4 inline-block rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Go home
          </a>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-baseline justify-between">
        <Heading level={1}>Today's check-in</Heading>
        <a href="/home" className="text-xs text-zinc-500 underline">Home</a>
      </div>
      <Text emphasis="secondary" className="mt-2">
        30 seconds. How are you today?
      </Text>

      <Card className="mt-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Slider label="Physical" value={physical} onChange={setPhysical} />
          <Slider label="Mental" value={mental} onChange={setMental} />
          <Slider label="Energy" value={energy} onChange={setEnergy} />
          <Slider label="Pain" value={pain} onChange={setPain} />

          <div>
            <Text className="text-sm">Anything in particular?</Text>
            <div className="mt-2 flex flex-wrap gap-2">
              {SYMPTOM_CHIPS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSymptom(s)}
                  className={`rounded-full px-3 py-1 text-xs ${
                    symptoms.includes(s)
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "border border-zinc-300 dark:border-zinc-700"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Text className="text-sm">Anything else (optional)</Text>
            <textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          {error ? (
            <Text emphasis="secondary" className="text-sm text-red-600">
              {error}
            </Text>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {busy ? "Saving…" : "Save check-in"}
          </button>
        </form>
      </Card>
    </main>
  );
}
