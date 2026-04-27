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

type Mode = "email" | "code";

type Props = {
  onSwitchToSignUp: () => void;
};

export function SignInScreen({ onSwitchToSignUp }: Props) {
  const [mode, setMode] = useState<Mode>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onStart() {
    if (!email) return;
    setBusy(true);
    try {
      const res = await api.startSignin(email);
      setChallengeId(res.challengeId);
      setMode("code");
    } catch {
      Alert.alert("Sign-in", "Couldn't start sign-in. Check the email and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function onVerify() {
    if (!challengeId || code.length !== 6) return;
    setBusy(true);
    try {
      const res = await api.verifySignin({ challengeId, code });
      await setSession({
        userId: res.userId,
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
      });
    } catch {
      Alert.alert("Sign-in", "That code didn't work. Try again, or request a new one.");
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
        <Text variant="h1">Welcome back</Text>
        <Text emphasis="secondary" style={{ marginTop: space.s2 }}>
          Enter the email you used to sign up. We'll send a one-time code.
        </Text>

        <Card style={{ marginTop: space.s5 }}>
          {mode === "email" ? (
            <>
              <Text variant="label">Email</Text>
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
                disabled={busy || !email}
                onPress={() => void onStart()}
                style={[styles.primary, (busy || !email) && styles.primaryDisabled]}
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
                {busy ? <ActivityIndicator color="white" /> : <Text style={styles.primaryText}>Verify and sign in</Text>}
              </Pressable>
              <Pressable
                onPress={() => {
                  setMode("email");
                  setCode("");
                  setChallengeId(null);
                }}
                style={{ marginTop: space.s2 }}
              >
                <Text emphasis="tertiary" style={styles.linkText}>
                  Use a different email
                </Text>
              </Pressable>
            </>
          )}
        </Card>

        <View style={{ marginTop: space.s6, alignItems: "center" }}>
          <Pressable onPress={onSwitchToSignUp}>
            <Text emphasis="secondary" style={styles.linkText}>
              New here? Create an account
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
