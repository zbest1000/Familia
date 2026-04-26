import { ScrollView, StyleSheet, View } from "react-native";

import { color, space } from "@familia/tokens";
import { Card, Text } from "@familia/ui-mobile";

export function HomeScreen() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.light.surface0 }}
      contentContainerStyle={styles.container}
    >
      <Text variant="h1">Today</Text>
      <Text emphasis="secondary" style={{ marginTop: space.s2 }}>
        Welcome. Here&apos;s where today shows up.
      </Text>

      <View style={{ height: space.s5 }} />

      <Card style={{ marginBottom: space.s3 }}>
        <Text variant="h3">Today&apos;s check-in</Text>
        <Text emphasis="secondary" style={{ marginTop: space.s1 }}>
          Take 30 seconds to log how you feel today.
        </Text>
      </Card>

      <Card style={{ marginBottom: space.s3 }}>
        <Text variant="h3">Recent alerts</Text>
        <Text emphasis="secondary" style={{ marginTop: space.s1 }}>
          No alerts.
        </Text>
      </Card>

      <Card style={{ marginBottom: space.s3 }}>
        <Text variant="h3">Wearable sync</Text>
        <Text emphasis="secondary" style={{ marginTop: space.s1 }}>
          No connected devices yet.
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
