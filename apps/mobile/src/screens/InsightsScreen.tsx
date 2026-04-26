import { ScrollView, StyleSheet } from "react-native";

import { color, space } from "@familia/tokens";
import { Card, Text } from "@familia/ui-mobile";

export function InsightsScreen() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.light.surface0 }}
      contentContainerStyle={styles.container}
    >
      <Text variant="h1">Insights</Text>
      <Text emphasis="secondary" style={{ marginTop: space.s2 }}>
        Summaries from your check-ins, wearables, and records.
      </Text>

      <Card style={{ marginTop: space.s5 }}>
        <Text variant="h3">Not enough data yet</Text>
        <Text emphasis="secondary" style={{ marginTop: space.s1 }}>
          After about a week of check-ins, summaries will appear here.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space.s4 },
});
