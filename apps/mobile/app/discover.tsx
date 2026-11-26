import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { getSignedInUser, signOut } from "../lib/auth";
import type { MobileUser } from "../lib/auth";

export default function Discover() {
  const router = useRouter();
  const [user, setUser] = useState<MobileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  const loadSession = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const signedInUser = await getSignedInUser();
      if (!signedInUser) {
        router.replace("/");
        return;
      }
      setUser(signedInUser);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not verify your sign-in.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadSession();
  }, [loadSession, retry]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      router.replace("/");
      setSigningOut(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#7657e8" />
        <Text style={styles.muted}>Loading your account…</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <Text style={styles.brand}>avenli<Text style={styles.brandDot}>.</Text></Text>
      <Text style={styles.eyebrow}>SIGNED IN</Text>
      <Text style={styles.title}>Hello, {user?.displayName || "there"}.</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your session is active</Text>
        <Text style={styles.cardCopy}>
          You’re signed in to the Flatmate Platform on this device. Mobile flatmate discovery is still a placeholder in this project.
        </Text>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
          <Pressable onPress={() => setRetry((value) => value + 1)} style={styles.retryButton}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: signingOut }}
        disabled={signingOut}
        onPress={handleSignOut}
        style={({ pressed }) => [styles.signOutButton, pressed && !signingOut ? styles.pressed : null]}
      >
        {signingOut ? <ActivityIndicator color="#7657e8" /> : <Text style={styles.signOutText}>Sign out</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 28, paddingTop: 70, backgroundColor: "#fff" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: "#fff" },
  brand: { marginBottom: 48, color: "#222033", fontSize: 28, fontWeight: "900" },
  brandDot: { color: "#7657e8" },
  eyebrow: { color: "#7657e8", fontSize: 11, fontWeight: "800", letterSpacing: 1.5 },
  title: { marginTop: 13, color: "#222033", fontSize: 34, fontWeight: "900" },
  email: { marginTop: 7, color: "#77758a", fontSize: 15 },
  muted: { color: "#77758a", fontSize: 14 },
  card: { marginTop: 30, padding: 20, borderWidth: 1, borderColor: "#eceaf2", borderRadius: 18, backgroundColor: "#fbfaff" },
  cardTitle: { color: "#222033", fontSize: 17, fontWeight: "800" },
  cardCopy: { marginTop: 9, color: "#77758a", fontSize: 14, lineHeight: 22 },
  errorBox: { marginTop: 18, padding: 14, borderRadius: 12, backgroundColor: "#fff3f2" },
  error: { color: "#a53c45", fontSize: 13, lineHeight: 19 },
  retryButton: { alignSelf: "flex-start", marginTop: 10, paddingVertical: 6 },
  retryText: { color: "#7657e8", fontSize: 13, fontWeight: "700" },
  signOutButton: { minHeight: 52, alignItems: "center", justifyContent: "center", marginTop: 30, borderWidth: 1, borderColor: "#7657e8", borderRadius: 14 },
  signOutText: { color: "#7657e8", fontSize: 15, fontWeight: "800" },
  pressed: { opacity: 0.8 },
});
