import { Card, Heading, Text } from "@familia/ui-web";

export default function SignInPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <Heading level={1}>Welcome back</Heading>
      <Text emphasis="secondary" className="mt-2">
        Enter the email or phone you used to sign up. We&apos;ll send a one-time
        code.
      </Text>

      <Card className="mt-8">
        <form action="#" method="post" className="flex flex-col gap-3">
          <label htmlFor="email" className="text-sm font-medium">
            Email or phone
          </label>
          <input
            id="email"
            name="email"
            type="text"
            inputMode="email"
            autoComplete="username"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            required
          />
          <button
            type="submit"
            className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Continue
          </button>
        </form>
      </Card>

      <Text emphasis="tertiary" className="mt-6 text-center text-xs">
        Sprint-0 shell — sign-in not wired to API yet.
      </Text>
    </main>
  );
}
