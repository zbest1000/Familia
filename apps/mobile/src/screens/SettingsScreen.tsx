import { ScrollView, StyleSheet } from "react-native";

import { color, space } from "@familia/tokens";
import { Card, Text } from "@familia/ui-mobile";

export function SettingsScreen() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.light.surface0 }}
      contentContainerStyle={styles.container}
    >
      <Text variant="h1">Settings</Text>
      <Text emphasis="secondary" style={{ marginTop: space.s2 }}>
        Account, security, privacy, sharing, devices, AI, exports.
      </Text>

      <Card style={{ marginTop: space.s5 }}>
        <Text variant="h3">Sprint-0 shell</Text>
        <Text emphasis="secondary" style={{ marginTop: space.s1 }}>
          Sections wired up in subsequent sprints. See docs/10 for the build
          sequence.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space.s4 },
});
