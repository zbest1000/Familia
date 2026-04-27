"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { Card, Heading, Text } from "@familia/ui-web";

import { api, clearSession, getAccessToken } from "@/lib/api";

type Relationship = Awaited<ReturnType<typeof api.listRelationships>>[number];

const RELATIONSHIP_OPTIONS = [
  "biological_parent",
  "biological_child",
  "biological_sibling",
  "biological_half_sibling",
  "spouse",
  "partner",
  "adoptive_parent",
  "adopted_child",
  "step_parent",
  "step_child",
  "guardian",
  "caregiver",
  "cousin",
  "aunt_uncle",
  "niece_nephew",
  "grandparent",
  "grandchild",
  "custom",
];

const PRESETS = [
  { value: "none", label: "No data" },
  { value: "emergency", label: "Emergency profile only" },
  { value: "care_bundle", label: "Care bundle" },
  { value: "full_record", label: "Full record" },
];

export default function FamilyPage() {
  const router = useRouter();
  const [relationships, setRelationships] = useState<Relationship[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Invite form
  const [showInvite, setShowInvite] = useState(false);
  const [inviteRel, setInviteRel] = useState("biological_sibling");
  const [inviteBio, setInviteBio] = useState(true);
  const [invitePreset, setInvitePreset] = useState("care_bundle");
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviteBusy, setInviteBusy] = useState(false);

  // Alert form
  const [showAlertFor, setShowAlertFor] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<
    "hereditary_risk" | "general_health_update" | "wellness_trend" | "emergency"
  >("general_health_update");
  const [alertTopic, setAlertTopic] = useState("");
  const [alertBusy, setAlertBusy] = useState(false);
  const [alertResult, setAlertResult] = useState<{ variantKey: string; text: string } | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/signin");
      return;
    }
    void refresh();
  }, [router]);

  async function refresh() {
    try {
      const rels = await api.listRelationships();
      setRelationships(rels);
    } catch (err) {
      const status = (err as { response?: { status?: number } } | undefined)?.response?.status;
      if (status === 401) {
        clearSession();
        router.replace("/signin");
      } else {
        setError("Couldn't load relationships.");
      }
    }
  }

  async function onCreateInvite(e: FormEvent) {
    e.preventDefault();
    setInviteBusy(true);
    try {
      const inv = await api.createInvite({
        proposedRelationship: inviteRel,
        proposedBiologicalLink: inviteBio,
        proposedPreset: invitePreset,
      });
      setInviteToken(inv.token);
    } catch {
      setError("Couldn't create invite.");
    } finally {
      setInviteBusy(false);
    }
  }

  async function onSendAlert(e: FormEvent, recipientId: string) {
    e.preventDefault();
    if (!alertTopic.trim()) return;
    setAlertBusy(true);
    setAlertResult(null);
    try {
      const res = await api.sendAlert({
        type: alertType,
        topic: alertTopic.trim(),
        recipientUserIds: [recipientId],
        disclosureMode: "identified",
      });
      const r = res.recipients[0];
      setAlertResult({ variantKey: r?.variantKey ?? "", text: r?.text ?? "" });
      setAlertTopic("");
    } catch (err) {
      setError(`Couldn't send alert: ${(err as Error).message}`);
    } finally {
      setAlertBusy(false);
    }
  }

  async function onRemove(id: string) {
    if (!confirm("Remove this relationship? Any active sharing will be revoked.")) return;
    try {
      await api.removeRelationship(id);
      await refresh();
    } catch {
      setError("Couldn't remove relationship.");
    }
  }

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Heading level={1}>Family</Heading>
        <Card className="mt-6">
          <Text emphasis="secondary">{error}</Text>
        </Card>
      </main>
    );
  }
  if (!relationships) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Heading level={1}>Family</Heading>
        <Text emphasis="secondary" className="mt-2">
          Loading…
        </Text>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-baseline justify-between">
        <Heading level={1}>Family</Heading>
        <a href="/home" className="text-xs text-zinc-500 underline">
          Home
        </a>
      </div>
      <Text emphasis="secondary" className="mt-2">
        Your family. You decide who sees what.
      </Text>

      {relationships.length === 0 ? (
        <Card className="mt-6">
          <Heading level={3}>No relatives in your tree yet</Heading>
          <Text emphasis="secondary" className="mt-1">
            You can add anyone — biological, adopted, step, chosen — and decide who sees what.
          </Text>
        </Card>
      ) : (
        <div className="mt-6 space-y-3">
          {relationships.map((r) => (
            <Card key={r.id}>
              <div className="flex items-center justify-between">
                <div>
                  <Text>
                    <strong>{r.relatedUser?.firstName ?? "Unknown"}</strong>{" "}
                    {r.relatedUser?.lastName ?? ""}{" "}
                    <span className="text-zinc-500">
                      — {r.type.replace(/_/g, " ")}
                      {r.biologicalLink ? " · biological" : ""}
                    </span>
                  </Text>
                  {r.doNotAlert ? (
                    <Text emphasis="tertiary" className="text-xs">
                      Alerts muted from you to them
                    </Text>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowAlertFor(showAlertFor === r.id ? null : r.id);
                      setAlertResult(null);
                    }}
                    className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
                  >
                    {showAlertFor === r.id ? "Cancel" : "Send alert"}
                  </button>
                  <button
                    onClick={() => void onRemove(r.id)}
                    className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs dark:border-zinc-700"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {showAlertFor === r.id ? (
                <form onSubmit={(e) => onSendAlert(e, r.relatedUser!.id)} className="mt-3 flex flex-col gap-2">
                  <select
                    value={alertType}
                    onChange={(e) => setAlertType(e.target.value as typeof alertType)}
                    className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                  >
                    <option value="general_health_update">General health update</option>
                    <option value="hereditary_risk">Hereditary risk</option>
                    <option value="wellness_trend">Wellness trend</option>
                    <option value="emergency">Emergency</option>
                  </select>
                  <input
                    placeholder="Short topic (what's this about?)"
                    value={alertTopic}
                    onChange={(e) => setAlertTopic(e.target.value)}
                    className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                  />
                  <button
                    type="submit"
                    disabled={alertBusy || !alertTopic.trim()}
                    className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
                  >
                    {alertBusy ? "Sending…" : "Send"}
                  </button>
                  {alertResult ? (
                    <div className="mt-2 rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800">
                      <Text emphasis="tertiary" className="text-xs">
                        Variant chosen: <code>{alertResult.variantKey}</code>
                      </Text>
                      <Text className="mt-1">{alertResult.text}</Text>
                    </div>
                  ) : null}
                </form>
              ) : null}
            </Card>
          ))}
        </div>
      )}

      <Card className="mt-6">
        <div className="flex items-center justify-between">
          <Heading level={3}>Invite a relative</Heading>
          <button
            onClick={() => {
              setShowInvite(!showInvite);
              setInviteToken(null);
            }}
            className="text-xs text-zinc-500 underline"
          >
            {showInvite ? "Cancel" : "Generate invite"}
          </button>
        </div>

        {showInvite && !inviteToken ? (
          <form onSubmit={onCreateInvite} className="mt-3 flex flex-col gap-3">
            <label className="text-sm font-medium">Relationship</label>
            <select
              value={inviteRel}
              onChange={(e) => setInviteRel(e.target.value)}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              {RELATIONSHIP_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={inviteBio} onChange={(e) => setInviteBio(e.target.checked)} />
              Biological link (matters for hereditary alerts)
            </label>
            <label className="text-sm font-medium">What you propose to share</label>
            <select
              value={invitePreset}
              onChange={(e) => setInvitePreset(e.target.value)}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              {PRESETS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={inviteBusy}
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {inviteBusy ? "Generating…" : "Generate single-use link"}
            </button>
          </form>
        ) : null}

        {inviteToken ? (
          <div className="mt-3 rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800">
            <Text className="break-all">
              <strong>Send this link.</strong> It expires in 10 minutes and can be used once.
            </Text>
            <Text emphasis="tertiary" className="mt-2 break-all font-mono text-xs">
              {typeof window !== "undefined" ? `${window.location.origin}/accept/${inviteToken}` : `/accept/${inviteToken}`}
            </Text>
            <button
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.clipboard) {
                  void navigator.clipboard.writeText(`${window.location.origin}/accept/${inviteToken}`);
                }
              }}
              className="mt-2 rounded-md border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700"
            >
              Copy link
            </button>
          </div>
        ) : null}
      </Card>
    </main>
  );
}
