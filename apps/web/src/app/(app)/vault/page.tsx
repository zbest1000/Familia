"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { Card, Heading, Text } from "@familia/ui-web";

import { api, getAccessToken } from "@/lib/api";

type Doc = Awaited<ReturnType<typeof api.listDocuments>>[number];

const KINDS = [
  "lab_report",
  "imaging_report",
  "discharge_summary",
  "prescription",
  "insurance",
  "dental",
  "vision",
  "mental_health",
  "generic_medical",
];

export default function VaultPage() {
  const router = useRouter();
  const [docs, setDocs] = useState<Doc[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [kind, setKind] = useState("generic_medical");
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/signin");
      return;
    }
    void load();
  }, [router]);

  async function load() {
    try {
      const list = await api.listDocuments();
      setDocs(list);
    } catch (err) {
      if ((err as { response?: { status?: number } } | undefined)?.response?.status === 401) {
        router.replace("/signin");
      } else setError("Couldn't load your vault.");
    }
  }

  async function onUpload(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    try {
      await api.uploadDocument({ file, kind, title: title || undefined });
      setFile(null);
      setTitle("");
      await load();
    } catch (err) {
      setError(`Upload failed: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-baseline justify-between">
        <Heading level={1}>Vault</Heading>
        <a href="/home" className="text-xs text-zinc-500 underline">Home</a>
      </div>
      <Text emphasis="secondary" className="mt-2">
        Lab reports, prescriptions, discharge summaries, anything you want to keep. Private to you
        unless you share.
      </Text>

      <Card className="mt-6">
        <Heading level={3}>Upload a document</Heading>
        <form onSubmit={onUpload} className="mt-3 flex flex-col gap-3">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            accept="image/*,application/pdf"
            className="text-sm"
          />
          <div className="flex gap-2">
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {k.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <input
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <button
            type="submit"
            disabled={busy || !file}
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {busy ? "Uploading…" : "Upload"}
          </button>
          {error ? (
            <Text emphasis="secondary" className="text-sm text-red-600">
              {error}
            </Text>
          ) : null}
        </form>
      </Card>

      <div className="mt-6 space-y-2">
        {docs === null ? (
          <Text emphasis="secondary">Loading…</Text>
        ) : docs.length === 0 ? (
          <Card>
            <Text emphasis="secondary">
              No documents yet. Snap a lab report or upload a PDF to start your record.
            </Text>
          </Card>
        ) : (
          docs.map((d) => (
            <Card key={d.id} className="flex items-center justify-between">
              <div>
                <Text>
                  <strong>{d.title}</strong>{" "}
                  <span className="text-zinc-500">— {d.kind.replace(/_/g, " ")}</span>
                </Text>
                <Text emphasis="tertiary" className="text-xs">
                  {Math.round(d.sizeBytes / 1024)} KB · {d.contentType} · uploaded{" "}
                  {new Date(d.createdAt).toLocaleString()} · status: {d.extractionState}
                  {d.sensitivity !== "standard" ? ` · ${d.sensitivity}` : ""}
                </Text>
              </div>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
