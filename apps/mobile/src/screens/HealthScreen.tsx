import { ScrollView, StyleSheet } from "react-native";

import { color, space } from "@familia/tokens";
import { Card, Text } from "@familia/ui-mobile";

export function HealthScreen() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.light.surface0 }}
      contentContainerStyle={styles.container}
    >
      <Text variant="h1">Health</Text>
      <Text emphasis="secondary" style={{ marginTop: space.s2 }}>
        Your conditions, medications, allergies, labs, and documents.
      </Text>

      <Card style={{ marginTop: space.s5 }}>
        <Text variant="h3">No records yet</Text>
        <Text emphasis="secondary" style={{ marginTop: space.s1 }}>
          Add anything you&apos;ve been diagnosed with, take, or know about
          yourself. You can come back to anything.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space.s4 },
});
