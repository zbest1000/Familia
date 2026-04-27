import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";

import type { Medication, User } from "@familia/domain";
import { color, space } from "@familia/tokens";
import { Card, Text } from "@familia/ui-mobile";

import { api, clearSession } from "../lib/api";

export function HomeScreen() {
  const [me, setMe] = useState<User | null>(null);
  const [meds, setMeds] = useState<Medication[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [u, m] = await Promise.all([api.me(), api.listMedications()]);
        setMe(u);
        setMeds(m);
      } catch (err) {
        const status = (err as { response?: { status?: number } } | undefined)?.response?.status;
        if (status === 401) {
          await clearSession();
          return;
        }
        setError("Couldn't load your data right now.");
      }
    })();
  }, []);

  async function onSignout() {
    try {
      await api.signout();
    } catch {
      /* best effort */
    }
    await clearSession();
  }

  if (!me && !error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: color.light.surface0 }}>
        <ActivityIndicator />
      </View>
    );
  }

  const activeMeds = (meds ?? []).filter((m) => m.status === "active");

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.light.surface0 }}
      contentContainerStyle={styles.container}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
        <Text variant="h1">{me ? `Hello, ${me.firstName}` : "Today"}</Text>
        <Pressable onPress={() => void onSignout()}>
          <Text emphasis="tertiary" style={{ textDecorationLine: "underline" }}>
            Sign out
          </Text>
        </Pressable>
      </View>
      <Text emphasis="secondary" style={{ marginTop: space.s2 }}>
        Welcome. Here&apos;s where today shows up.
      </Text>

      {error ? (
        <Card style={{ marginTop: space.s5 }}>
          <Text emphasis="secondary">{error}</Text>
        </Card>
      ) : null}

      <View style={{ height: space.s5 }} />

      <Card style={{ marginBottom: space.s3 }}>
        <Text variant="h3">Today&apos;s check-in</Text>
        <Text emphasis="secondary" style={{ marginTop: space.s1 }}>
          Take 30 seconds to log how you feel today.
        </Text>
      </Card>

      <Card style={{ marginBottom: space.s3 }}>
        <Text variant="h3">Active medications ({activeMeds.length})</Text>
        {activeMeds.length === 0 ? (
          <Text emphasis="secondary" style={{ marginTop: space.s1 }}>
            No active medications. Add one from the Health tab.
          </Text>
        ) : (
          <View style={{ marginTop: space.s2 }}>
            {activeMeds.slice(0, 5).map((m) => (
              <Text key={m.id} variant="bodySmall" style={{ marginTop: space.s1 }}>
                • {m.name}
                {m.doseText ? `  ·  ${m.doseText}` : ""}
              </Text>
            ))}
          </View>
        )}
      </Card>

      <Card style={{ marginBottom: space.s3 }}>
        <Text variant="h3">Recent alerts</Text>
        <Text emphasis="secondary" style={{ marginTop: space.s1 }}>
          No alerts in your inbox.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: space.s4,
  },
});
