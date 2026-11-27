import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import OAuthButtons from "../components/oauth-buttons";
import { getSignedInUser, registerMobile, signIn } from "../lib/auth";
import type { MobileUser } from "../lib/auth";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [mode, setMode] = useState<"sign-in" | "register">("sign-in");
  const [busy, setBusy] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    getSignedInUser()
      .then((user: MobileUser | null) => {
        if (active && user) router.replace("/discover");
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Could not check your saved sign-in.");
      })
      .finally(() => {
        if (active) setCheckingSession(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  async function submit() {
    if ((mode === "register" && displayName.trim().length < 2) || !email.trim() || !password) {
      setError(mode === "register" ? "Enter your name, email address, and password." : "Enter your email address and password.");
      return;
    }

    setError("");
    setNotice("");
    setBusy(true);
    try {
      if (mode === "register") {
        const result = await registerMobile(displayName, email, password);
        setNotice(result.message);
        setMode("sign-in");
        setPassword("");
      } else {
        await signIn(email, password);
        router.replace("/discover");
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not sign in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (checkingSession) {
    return (
      <View style={styles.loadingPage}>
        <ActivityIndicator color="#7657e8" />
        <Text style={styles.loadingText}>Checking your sign-in…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>avenli<Text style={styles.brandDot}>.</Text></Text>
        <Text style={styles.eyebrow}>YOUR NEXT CHAPTER STARTS HERE</Text>
        <Text style={styles.title}>Welcome{"\n"}back.</Text>
        <Text style={styles.description}>
          {mode === "sign-in" ? "Sign in to find homes and flatmates that fit your life." : "Create an account to meet flatmates and find a place that fits."}
        </Text>

        <View style={styles.socialSection}>
          <OAuthButtons onSignedIn={() => router.replace("/discover")} />
          <View style={styles.divider}><View style={styles.dividerLine} /><Text style={styles.dividerText}>or use email</Text><View style={styles.dividerLine} /></View>
        </View>

        <View style={styles.form}>
          {mode === "register" ? (
            <>
              <Text style={styles.label}>Your name</Text>
              <TextInput
                accessibilityLabel="Your name"
                autoCapitalize="words"
                autoComplete="name"
                editable={!busy}
                maxLength={80}
                onChangeText={setDisplayName}
                placeholder="Your name"
                placeholderTextColor="#8e8b9d"
                style={styles.input}
                value={displayName}
              />
            </>
          ) : null}
          <Text style={styles.label}>Email address</Text>
          <TextInput
            accessibilityLabel="Email address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            editable={!busy}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#8e8b9d"
            returnKeyType="next"
            style={styles.input}
            textContentType="emailAddress"
            value={email}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            accessibilityLabel="Password"
            autoCapitalize="none"
            autoComplete="current-password"
            editable={!busy}
            onChangeText={setPassword}
            onSubmitEditing={submit}
            placeholder="Your password"
            placeholderTextColor="#8e8b9d"
            returnKeyType="go"
            secureTextEntry
            style={styles.input}
            maxLength={128}
            textContentType="password"
            value={password}
          />

          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          {notice ? <Text accessibilityRole="status" style={styles.notice}>{notice}</Text> : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: busy }}
            disabled={busy}
            onPress={submit}
            style={({ pressed }) => [styles.button, pressed && !busy ? styles.buttonPressed : null, busy ? styles.buttonBusy : null]}
          >
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{mode === "sign-in" ? "Sign in" : "Create account"}</Text>}
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={() => { setError(""); setNotice(""); setMode(mode === "sign-in" ? "register" : "sign-in"); }}
          style={styles.switchMode}
        >
          <Text style={styles.switchModeText}>{mode === "sign-in" ? "New here? Create an account" : "Already have an account? Sign in"}</Text>
        </Pressable>
        <Text style={styles.footer}>Your sign-in session is stored securely on this device.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#fff" },
  content: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 28, paddingTop: 58, paddingBottom: 42 },
  loadingPage: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: "#fff" },
  loadingText: { color: "#77758a", fontSize: 14 },
  brand: { marginBottom: 42, color: "#222033", fontSize: 28, fontWeight: "900" },
  brandDot: { color: "#7657e8" },
  eyebrow: { color: "#7657e8", fontSize: 11, fontWeight: "800", letterSpacing: 1.5 },
  title: { marginTop: 14, color: "#222033", fontSize: 47, fontWeight: "900", lineHeight: 52 },
  description: { marginTop: 12, color: "#77758a", fontSize: 15, lineHeight: 23 },
  form: { marginTop: 32 },
  socialSection: { marginTop: 27 },
  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 19 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#e9e6ef" },
  dividerText: { color: "#9290a0", fontSize: 11 },
  label: { marginBottom: 8, color: "#302d40", fontSize: 13, fontWeight: "700" },
  input: { minHeight: 52, marginBottom: 19, paddingHorizontal: 15, borderWidth: 1, borderColor: "#e4e1eb", borderRadius: 13, color: "#222033", fontSize: 15, backgroundColor: "#fff" },
  error: { marginBottom: 14, color: "#a53c45", fontSize: 13, lineHeight: 19 },
  notice: { marginBottom: 14, color: "#3f6840", fontSize: 13, lineHeight: 19 },
  button: { minHeight: 54, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "#7657e8" },
  buttonPressed: { opacity: 0.86 },
  buttonBusy: { opacity: 0.7 },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  footer: { marginTop: 24, color: "#8e8b9d", fontSize: 12, textAlign: "center" },
  switchMode: { alignSelf: "center", marginTop: 18, paddingVertical: 8 },
  switchModeText: { color: "#6246c6", fontSize: 13, fontWeight: "700" },
});
