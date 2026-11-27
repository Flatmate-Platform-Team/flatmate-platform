import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import * as Crypto from "expo-crypto";
import * as WebBrowser from "expo-web-browser";
import {
  completeMobileOAuth,
  mobileOAuthRedirectUrl,
  mobileOAuthStartUrl,
  MobileApiError,
} from "../lib/auth";

type Provider = "google" | "facebook" | "apple";
const providers: { id: Provider; label: string; symbol: string }[] = [
  { id: "google", label: "Continue with Google", symbol: "G" },
  { id: "facebook", label: "Continue with Facebook", symbol: "f" },
  { id: "apple", label: "Continue with Apple", symbol: "A" },
];

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

export default function OAuthButtons({ onSignedIn }: { onSignedIn: () => void }) {
  const [busyProvider, setBusyProvider] = useState<Provider | null>(null);
  const [error, setError] = useState("");

  async function start(provider: Provider) {
    setError("");
    setBusyProvider(provider);
    try {
      const verifier = bytesToHex(await Crypto.getRandomBytesAsync(32));
      const challenge = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        verifier,
        { encoding: Crypto.CryptoEncoding.HEX },
      );
      const result = await WebBrowser.openAuthSessionAsync(
        mobileOAuthStartUrl(provider, challenge),
        mobileOAuthRedirectUrl,
      );
      if (result.type !== "success" || !result.url) return;

      const callback = new URL(result.url);
      if (callback.protocol !== "flatmate:" || callback.hostname !== "auth" || callback.pathname !== "/callback") {
        throw new MobileApiError("The sign-in provider returned to an unexpected address. Please try again.");
      }
      if (callback.searchParams.has("error")) {
        throw new MobileApiError("Sign-in was not completed. You can try again or use email and password.");
      }
      const handoff = callback.searchParams.get("handoff");
      if (!handoff) throw new MobileApiError("The sign-in provider did not finish the secure handoff. Please try again.");
      await completeMobileOAuth(handoff, verifier);
      onSignedIn();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not sign in with that provider. Please try again.");
    } finally {
      setBusyProvider(null);
    }
  }

  return (
    <View style={styles.container}>
      {providers.map((provider) => (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: busyProvider !== null }}
          disabled={busyProvider !== null}
          key={provider.id}
          onPress={() => void start(provider.id)}
          style={({ pressed }) => [styles.button, pressed && !busyProvider ? styles.pressed : null, busyProvider ? styles.disabled : null]}
        >
          {busyProvider === provider.id ? <ActivityIndicator color="#302d40" /> : <Text style={[styles.symbol, provider.id === "facebook" ? styles.facebook : null]}>{provider.symbol}</Text>}
          <Text style={styles.label}>{busyProvider === provider.id ? "Opening secure sign-in…" : provider.label}</Text>
        </Pressable>
      ))}
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 9 },
  button: { minHeight: 49, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 11, borderWidth: 1, borderColor: "#e4e1eb", borderRadius: 13, backgroundColor: "#fff" },
  symbol: { width: 20, color: "#4285f4", fontSize: 15, fontWeight: "900", textAlign: "center" },
  facebook: { color: "#1877f2", fontSize: 20 },
  label: { color: "#302d40", fontSize: 13, fontWeight: "700" },
  pressed: { backgroundColor: "#fbfaff", borderColor: "#7657e8" },
  disabled: { opacity: 0.65 },
  error: { marginTop: 2, color: "#a53c45", fontSize: 12, lineHeight: 18 },
});
