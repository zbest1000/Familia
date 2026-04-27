import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { color, fontSize, radius, space } from "@familia/tokens";
import { Card, Text } from "@familia/ui-mobile";

import { api, setSession } from "../lib/api";

type Mode = "details" | "code";

type Props = {
  onSwitchToSignIn: () => void;
};

export function SignUpScreen({ onSwitchToSignIn }: Props) {
  const [mode, setMode] = useState<Mode>("details");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onStart() {
    if (!firstName || !email) return;
    setBusy(true);
    try {
      const res = await api.startSignup(email);
      setChallengeId(res.challengeId);
      setMode("code");
    } catch {
      Alert.alert("Sign-up", "Couldn't start sign-up. Check the email and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function onVerify() {
    if (!challengeId || code.length !== 6) return;
    setBusy(true);
    try {
      const res = await api.verifySignup({
        challengeId,
        code,
        firstName,
        lastName: lastName || undefined,
      });
      await setSession({
        userId: res.userId,
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
      });
    } catch {
      Alert.alert(
        "Sign-up",
        "That code didn't work, or an account with that email already exists.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: color.light.surface0 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text variant="h1">Create your account</Text>
        <Text emphasis="secondary" style={{ marginTop: space.s2 }}>
          Three things we promise: encrypted, never sold, exportable any time.
        </Text>

        <Card style={{ marginTop: space.s5 }}>
          {mode === "details" ? (
            <>
              <Text variant="label">First name</Text>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                autoComplete="given-name"
                editable={!busy}
                style={styles.input}
              />
              <Text variant="label" style={{ marginTop: space.s3 }}>
                Last name (optional)
              </Text>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                autoComplete="family-name"
                editable={!busy}
                style={styles.input}
              />
              <Text variant="label" style={{ marginTop: space.s3 }}>
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                editable={!busy}
                style={styles.input}
              />
              <Pressable
                disabled={busy || !firstName || !email}
                onPress={() => void onStart()}
                style={[styles.primary, (busy || !firstName || !email) && styles.primaryDisabled]}
              >
                {busy ? <ActivityIndicator color="white" /> : <Text style={styles.primaryText}>Send code</Text>}
              </Pressable>
            </>
          ) : (
            <>
              <Text variant="label">6-digit code sent to {email}</Text>
              <TextInput
                value={code}
                onChangeText={(t) => setCode(t.replace(/\D/g, "").slice(0, 6))}
                autoComplete="one-time-code"
                keyboardType="number-pad"
                editable={!busy}
                style={[styles.input, styles.codeInput]}
                maxLength={6}
              />
              <Pressable
                disabled={busy || code.length !== 6}
                onPress={() => void onVerify()}
                style={[styles.primary, (busy || code.length !== 6) && styles.primaryDisabled]}
              >
                {busy ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.primaryText}>Verify and create account</Text>
                )}
              </Pressable>
            </>
          )}
        </Card>

        <View style={{ marginTop: space.s6, alignItems: "center" }}>
          <Pressable onPress={onSwitchToSignIn}>
            <Text emphasis="secondary" style={styles.linkText}>
              Already have an account? Sign in
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space.s4, paddingTop: space.s9 },
  input: {
    marginTop: space.s2,
    paddingVertical: space.s3,
    paddingHorizontal: space.s3,
    fontSize: fontSize.body,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.light.borderStrong,
    backgroundColor: color.light.surface0,
  },
  codeInput: {
    fontSize: 24,
    textAlign: "center",
    letterSpacing: 6,
  },
  primary: {
    marginTop: space.s4,
    paddingVertical: space.s3,
    borderRadius: radius.md,
    backgroundColor: color.light.textPrimary,
    alignItems: "center",
  },
  primaryDisabled: { opacity: 0.5 },
  primaryText: { color: "white" },
  linkText: { textDecorationLine: "underline" },
});
