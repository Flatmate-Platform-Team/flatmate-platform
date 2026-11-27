import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!checkingSession) {
      entrance.setValue(0);
      Animated.timing(entrance, { toValue: 1, duration: 520, useNativeDriver: true }).start();
    }
  }, [checkingSession, entrance]);

  useEffect(() => {
    let active = true;

    getSignedInUser()
      .then((user: MobileUser | null) => {
        if (active && user) router.replace("/home");
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
        router.replace("/home");
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
        <ActivityIndicator color="#526dff" />
        <Text style={styles.loadingText}>Checking your sign-in…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View pointerEvents="none" style={styles.glowTop} />
      <View pointerEvents="none" style={styles.glowBottom} />
      <Animated.ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" style={{ opacity: entrance, transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }}>
        <Text style={styles.brand}>avenli<Text style={styles.brandDot}>.</Text></Text>
        <Text style={styles.eyebrow}>YOUR NEXT CHAPTER STARTS HERE</Text>
        <Text style={styles.title}>Welcome{"\n"}back.</Text>
        <Text style={styles.description}>
          {mode === "sign-in" ? "Sign in to find homes and flatmates that fit your life." : "Create an account to meet flatmates and find a place that fits."}
        </Text>

        <View style={styles.socialSection}>
          <OAuthButtons onSignedIn={() => router.replace("/home")} />
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
            {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>{mode === "sign-in" ? "Sign in" : "Create account"}</Text>}
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
      </Animated.ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#080808" },
  glowTop: { position: "absolute", top: -135, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: "rgba(48,79,254,0.17)" },
  glowBottom: { position: "absolute", bottom: 70, left: -180, width: 300, height: 300, borderRadius: 150, backgroundColor: "rgba(232,255,0,0.05)" },
  content: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 28, paddingTop: 58, paddingBottom: 42 },
  loadingPage: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: "#080808" },
  loadingText: { color: "#A1A1AA", fontSize: 14 },
  brand: { marginBottom: 42, color: "#FFFFFF", fontSize: 28, fontWeight: "900", letterSpacing: -1 },
  brandDot: { color: "#526DFF" },
  eyebrow: { color: "#8798FF", fontSize: 11, fontWeight: "800", letterSpacing: 1.5 },
  title: { marginTop: 14, color: "#FFFFFF", fontSize: 47, fontWeight: "900", lineHeight: 52, letterSpacing: -2 },
  description: { marginTop: 12, color: "#A1A1AA", fontSize: 15, lineHeight: 23 },
  form: { marginTop: 22, padding: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", borderRadius: 22, backgroundColor: "rgba(255,255,255,0.045)", shadowColor: "#304FFE", shadowOpacity: 0.1, shadowRadius: 22, shadowOffset: { width: 0, height: 10 }, elevation: 3 },
  socialSection: { marginTop: 27, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderRadius: 22, backgroundColor: "rgba(255,255,255,0.035)" },
  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 19 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.14)" },
  dividerText: { color: "#A1A1AA", fontSize: 11 },
  label: { marginBottom: 8, color: "#F4F4F5", fontSize: 13, fontWeight: "700" },
  input: { minHeight: 52, marginBottom: 19, paddingHorizontal: 15, borderWidth: 1, borderColor: "rgba(255,255,255,0.16)", borderRadius: 15, color: "#FFFFFF", fontSize: 15, backgroundColor: "#101011" },
  error: { marginBottom: 14, color: "#FF9E96", fontSize: 13, lineHeight: 19 },
  notice: { marginBottom: 14, color: "#8FE3B0", fontSize: 13, lineHeight: 19 },
  button: { minHeight: 54, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "#304FFE", shadowColor: "#304FFE", shadowOpacity: 0.32, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  buttonPressed: { opacity: 0.86, transform: [{ scale: 0.985 }] },
  buttonBusy: { opacity: 0.7 },
  buttonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  footer: { marginTop: 24, color: "#A1A1AA", fontSize: 12, textAlign: "center" },
  switchMode: { alignSelf: "center", marginTop: 18, paddingVertical: 8 },
  switchModeText: { color: "#E8FF00", fontSize: 13, fontWeight: "700" },
});
