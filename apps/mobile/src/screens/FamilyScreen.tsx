import { ScrollView, StyleSheet } from "react-native";

import { color, space } from "@familia/tokens";
import { Card, Text } from "@familia/ui-mobile";

export function FamilyScreen() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.light.surface0 }}
      contentContainerStyle={styles.container}
    >
      <Text variant="h1">Family</Text>
      <Text emphasis="secondary" style={{ marginTop: space.s2 }}>
        Your family. You decide who sees what.
      </Text>

      <Card style={{ marginTop: space.s5 }}>
        <Text variant="h3">No relatives in your tree yet</Text>
        <Text emphasis="secondary" style={{ marginTop: space.s1 }}>
          You can add anyone — biological, adopted, step, chosen — and decide
          who sees what.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space.s4 },
});
