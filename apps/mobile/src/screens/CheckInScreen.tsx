import { useState } from "react";
import {
  ActivityIndicator,
  Alert as RNAlert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { color, radius, space } from "@familia/tokens";
import { Card, Text } from "@familia/ui-mobile";

import { api } from "../lib/api";

const SYMPTOMS = [
  "headache",
  "nausea",
  "fatigue",
  "anxious",
  "low mood",
  "joint pain",
  "back pain",
  "insomnia",
];

function Slider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <View style={{ marginTop: space.s4 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text variant="bodySmall">{label}</Text>
        <Text variant="bodySmall" emphasis="secondary">
          {value}/10
        </Text>
      </View>
      <View style={{ flexDirection: "row", marginTop: space.s2, gap: space.s1 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <Pressable
            key={n}
            onPress={() => onChange(n)}
            style={[
              styles.dot,
              {
                backgroundColor:
                  n <= value ? color.light.textPrimary : color.light.borderSubtle,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

export function CheckInScreen() {
  const [physical, setPhysical] = useState(6);
  const [mental, setMental] = useState(6);
  const [energy, setEnergy] = useState(6);
  const [pain, setPain] = useState(2);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [freeText, setFreeText] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  function toggleSymptom(s: string) {
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  async function onSave() {
    setBusy(true);
    try {
      await api.submitCheckIn({
        cadence: "daily",
        physical,
        mental,
        energy,
        pain,
        symptoms,
        freeText: freeText.trim() || undefined,
      });
      setDone(true);
    } catch {
      RNAlert.alert("Couldn't save", "Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: color.light.surface0 }} contentContainerStyle={{ padding: space.s4 }}>
        <Text variant="h1">Saved</Text>
        <Card style={{ marginTop: space.s4 }}>
          <Text emphasis="secondary">
            Logged. We&apos;ll surface patterns in your next weekly summary.
          </Text>
          <Pressable onPress={() => setDone(false)} style={[styles.primary, { marginTop: space.s4 }]}>
            <Text style={{ color: "white" }}>New check-in</Text>
          </Pressable>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.light.surface0 }} contentContainerStyle={{ padding: space.s4 }}>
      <Text variant="h1">Today&apos;s check-in</Text>
      <Text emphasis="secondary" style={{ marginTop: space.s2 }}>
        30 seconds. How are you today?
      </Text>

      <Card style={{ marginTop: space.s4 }}>
        <Slider label="Physical" value={physical} onChange={setPhysical} />
        <Slider label="Mental" value={mental} onChange={setMental} />
        <Slider label="Energy" value={energy} onChange={setEnergy} />
        <Slider label="Pain" value={pain} onChange={setPain} />

        <View style={{ marginTop: space.s5 }}>
          <Text variant="bodySmall">Anything in particular?</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.s2, marginTop: space.s2 }}>
            {SYMPTOMS.map((s) => (
              <Pressable
                key={s}
                onPress={() => toggleSymptom(s)}
                style={[
                  styles.chip,
                  symptoms.includes(s) ? styles.chipOn : styles.chipOff,
                ]}
              >
                <Text
                  variant="bodySmall"
                  style={symptoms.includes(s) ? { color: "white" } : undefined}
                >
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ marginTop: space.s5 }}>
          <Text variant="bodySmall">Anything else (optional)</Text>
          <TextInput
            value={freeText}
            onChangeText={setFreeText}
            multiline
            numberOfLines={3}
            style={styles.textarea}
          />
        </View>

        <Pressable
          disabled={busy}
          onPress={() => void onSave()}
          style={[styles.primary, { marginTop: space.s5 }, busy && { opacity: 0.5 }]}
        >
          {busy ? <ActivityIndicator color="white" /> : <Text style={{ color: "white" }}>Save check-in</Text>}
        </Pressable>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  dot: {
    flex: 1,
    height: 28,
    borderRadius: radius.sm,
  },
  chip: {
    paddingHorizontal: space.s3,
    paddingVertical: space.s1 + 2,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  chipOn: { backgroundColor: color.light.textPrimary, borderColor: color.light.textPrimary },
  chipOff: { backgroundColor: color.light.surface0, borderColor: color.light.borderStrong },
  textarea: {
    marginTop: space.s2,
    paddingHorizontal: space.s3,
    paddingVertical: space.s2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.light.borderStrong,
    backgroundColor: color.light.surface0,
    minHeight: 80,
    textAlignVertical: "top",
  },
  primary: {
    paddingVertical: space.s3,
    borderRadius: radius.md,
    backgroundColor: color.light.textPrimary,
    alignItems: "center",
  },
});
