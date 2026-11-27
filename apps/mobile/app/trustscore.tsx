import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppFrame, Eyebrow, PreviewTag, SectionTitle, palette, ui } from "../components/app-ui";

const checks = [
  { title: "Email address", status: "Status unavailable", detail: "Account email is present; confirmation data is not exposed to the app.", symbol: "@" },
  { title: "Phone number", status: "Not connected", detail: "No phone verification flow is currently available.", symbol: "⌕" },
  { title: "Identity", status: "Not started", detail: "Identity documents are not collected or checked by this prototype.", symbol: "◈" },
  { title: "Property listings", status: "Not verified", detail: "Listing verification is not implemented yet.", symbol: "⌂" },
];

export default function TrustScore() {
  const router = useRouter();
  return (
    <AppFrame active="Household">
      <View style={styles.heading}><Eyebrow>TRUST & TRANSPARENCY</Eyebrow><Text style={ui.heading}>Trust, made{ "\n" }clear.</Text><Text style={ui.subheading}>See which details are confirmed, and which still need a real verification flow.</Text></View>
      <PreviewTag>NO TRUST SCORE IS CALCULATED</PreviewTag>
      <View style={styles.summary}><View style={styles.shield}><Text style={styles.shieldText}>◈</Text></View><View style={{ flex: 1 }}><Text style={styles.summaryTitle}>Your verification status</Text><Text style={ui.muted}>No completed verification is recorded here.</Text></View></View>
      <SectionTitle title="Verification checklist" />
      <View style={styles.checkCard}>{checks.map((item, index) => <View key={item.title} style={[styles.checkRow, index < checks.length - 1 && styles.border]}><View style={styles.checkIcon}><Text style={styles.checkSymbol}>{item.symbol}</Text></View><View style={{ flex: 1, gap: 4 }}><Text style={styles.checkTitle}>{item.title}</Text><Text style={styles.status}>{item.status}</Text><Text style={styles.detail}>{item.detail}</Text></View></View>)}</View>
      <View style={styles.safety}><Text style={styles.safetyTitle}>Stay in control</Text><Text style={ui.muted}>Report and block actions will be shown here when they are connected to the safety tools.</Text><Pressable accessibilityRole="button" onPress={() => router.push("/messages")} style={styles.control}><Text style={styles.controlText}>Open messages preview  →</Text></Pressable></View>
      <Text style={styles.disclaimer}>A badge will only appear after a check is actually completed and verified. No personal identity data is collected by this screen.</Text>
    </AppFrame>
  );
}

const styles = StyleSheet.create({
  heading: { gap: 5 }, summary: { flexDirection: "row", alignItems: "center", gap: 13, padding: 17, borderWidth: 1, borderColor: palette.line, borderRadius: 20, backgroundColor: palette.card }, shield: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "#292020" }, shieldText: { color: palette.danger, fontSize: 25 }, summaryTitle: { marginBottom: 4, color: palette.white, fontSize: 13, fontWeight: "900" }, checkCard: { paddingHorizontal: 14, borderWidth: 1, borderColor: palette.line, borderRadius: 20, backgroundColor: palette.card }, checkRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 15 }, border: { borderBottomWidth: 1, borderBottomColor: palette.line }, checkIcon: { width: 37, height: 37, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: "#22232A" }, checkSymbol: { color: palette.muted, fontSize: 17, fontWeight: "800" }, checkTitle: { color: palette.white, fontSize: 12, fontWeight: "800" }, status: { alignSelf: "flex-start", color: palette.yellow, fontSize: 9, fontWeight: "900" }, detail: { color: palette.muted, fontSize: 10, lineHeight: 15 }, safety: { gap: 7, padding: 16, borderWidth: 1, borderColor: palette.line, borderRadius: 18, backgroundColor: "#151515" }, safetyTitle: { color: palette.white, fontSize: 13, fontWeight: "900" }, control: { alignSelf: "flex-start", marginTop: 5, paddingVertical: 7 }, controlText: { color: palette.blueLight, fontSize: 11, fontWeight: "800" }, disclaimer: { color: "#85858D", fontSize: 9, lineHeight: 14, textAlign: "center" },
});
