import { Card, Heading, Text } from "@familia/ui-web";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Heading level={1}>Today</Heading>
      <Text emphasis="secondary" className="mt-2">
        Welcome. Here&apos;s where today shows up.
      </Text>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <Heading level={3}>Today&apos;s check-in</Heading>
          <Text emphasis="secondary" className="mt-1">
            Take 30 seconds to log how you feel today.
          </Text>
          <button className="mt-3 rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
            Start a check-in
          </button>
        </Card>
        <Card>
          <Heading level={3}>Recent alerts</Heading>
          <Text emphasis="secondary" className="mt-1">
            No alerts. We&apos;ll surface family alerts and document review
            here.
          </Text>
        </Card>
        <Card>
          <Heading level={3}>Wearable sync</Heading>
          <Text emphasis="secondary" className="mt-1">
            No connected devices yet.
          </Text>
        </Card>
        <Card>
          <Heading level={3}>Sharing</Heading>
          <Text emphasis="secondary" className="mt-1">
            You haven&apos;t shared with anyone yet.
          </Text>
        </Card>
      </div>
    </main>
  );
}
