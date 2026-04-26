import { Card, Heading, Text } from "@familia/ui-web";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <Heading level={1}>FAMILIA</Heading>
      <Text emphasis="secondary" className="mt-2">
        Your health. Your family. Your control.
      </Text>

      <Card className="mt-8">
        <Heading level={3}>Sprint-0 shell</Heading>
        <Text emphasis="secondary" className="mt-2">
          The web app is wired to <code>@familia/ui-web</code>,{" "}
          <code>@familia/tokens</code>, <code>@familia/sdk</code>. Sign-in,
          health profile, family tree, and consent landing in subsequent
          sprints — see <a className="underline" href="https://github.com/zbest1000/Familia/blob/main/docs/10_MVP_BUILD_SEQUENCE.md">docs/10</a>.
        </Text>
      </Card>

      <Card className="mt-4">
        <Heading level={3}>Three things we promise</Heading>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-sm">
          <li>Your data is encrypted and only you decide who sees it.</li>
          <li>We will never sell or share without your consent.</li>
          <li>You can export or delete everything, anytime.</li>
        </ul>
      </Card>
    </main>
  );
}
