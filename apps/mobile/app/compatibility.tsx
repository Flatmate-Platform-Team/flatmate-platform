import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ActionButton, AppFrame, Eyebrow, PreviewTag, SectionTitle, palette, ui } from "../components/app-ui";

const details = [
  { label: "Budget match", value: 95, detail: "Comfortable monthly range" },
  { label: "Location match", value: 88, detail: "Preferred areas overlap" },
  { label: "Lifestyle match", value: 91, detail: "Similar home routines" },
  { label: "Sleep schedule", value: 84, detail: "Early bird · flexible" },
  { label: "Cleanliness", value: 93, detail: "Shared-space expectations" },
  { label: "Food preferences", value: 78, detail: "Room for different tastes" },
];

export default function Compatibility() {
  const router = useRouter();
  return (
    <AppFrame active="Discover">
      <View style={styles.heading}><Eyebrow>THE DETAILS THAT MAKE A HOME</Eyebrow><Text style={ui.heading}>Compatibility,{ "\n" }with more context.</Text><Text style={ui.subheading}>A thoughtful concept for comparing the small things that matter every day.</Text></View>
      <PreviewTag>ILLUSTRATIVE DEMO · NOT A REAL MATCH SCORE</PreviewTag>
      <View style={styles.scoreCard}>
        <View style={styles.orb}><View style={styles.orbInner}><Text style={styles.score}>92<Text style={styles.percent}>%</Text></Text><Text style={styles.scoreLabel}>SAMPLE</Text></View></View>
        <Text style={styles.scoreHeadline}>Your lifestyles match.</Text>
        <Text style={styles.scoreCopy}>You could be great flatmates.</Text>
        <Text style={styles.scoreNote}>This example score is illustrative only. The app does not calculate compatibility yet.</Text>
      </View>
      <SectionTitle title="What could fit well" />
      <View style={styles.factorCard}>{details.map((item, index) => <View key={item.label} style={[styles.factor, index < details.length - 1 && styles.factorBorder]}><View style={styles.factorHead}><View style={{ flex: 1 }}><Text style={styles.factorTitle}>{item.label}</Text><Text style={ui.muted}>{item.detail}</Text></View><Text style={styles.factorValue}>{item.value}%</Text></View><View style={styles.track}><View style={[styles.fill, { width: `${item.value}%` }]} /></View></View>)}</View>
      <View style={styles.note}><Text style={styles.noteMark}>✳</Text><Text style={styles.noteText}>Compatibility should help start a conversation, not make the decision for you.</Text></View>
      <ActionButton label="Browse flatmates" onPress={() => router.push("/discover")} />
    </AppFrame>
  );
}

const styles = StyleSheet.create({
  heading: { gap: 5 }, scoreCard: { alignItems: "center", padding: 22, borderWidth: 1, borderColor: "rgba(82,109,255,0.38)", borderRadius: 23, backgroundColor: "#15182A" }, orb: { width: 142, height: 142, alignItems: "center", justifyContent: "center", borderWidth: 8, borderColor: palette.blueLight, borderRightColor: "rgba(82,109,255,0.22)", borderBottomColor: "rgba(82,109,255,0.45)", borderRadius: 72, shadowColor: palette.blue, shadowOpacity: 0.3, shadowRadius: 22, shadowOffset: { width: 0, height: 0 }, elevation: 5 }, orbInner: { alignItems: "center" }, score: { color: palette.white, fontSize: 39, fontWeight: "900", letterSpacing: -2 }, percent: { color: palette.blueLight, fontSize: 20 }, scoreLabel: { color: palette.yellow, fontSize: 8, fontWeight: "900", letterSpacing: 1.4 }, scoreHeadline: { marginTop: 18, color: palette.white, fontSize: 19, fontWeight: "900" }, scoreCopy: { marginTop: 4, color: palette.blueLight, fontSize: 13, fontWeight: "700" }, scoreNote: { marginTop: 13, color: palette.muted, fontSize: 9, lineHeight: 14, textAlign: "center" }, factorCard: { paddingHorizontal: 15, borderWidth: 1, borderColor: palette.line, borderRadius: 20, backgroundColor: palette.card }, factor: { gap: 9, paddingVertical: 14 }, factorBorder: { borderBottomWidth: 1, borderBottomColor: palette.line }, factorHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }, factorTitle: { marginBottom: 4, color: palette.white, fontSize: 12, fontWeight: "800" }, factorValue: { color: palette.yellow, fontSize: 15, fontWeight: "900" }, track: { height: 6, overflow: "hidden", borderRadius: 4, backgroundColor: "#303034" }, fill: { height: 6, borderRadius: 4, backgroundColor: palette.blueLight }, note: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 16, backgroundColor: "#171A2B" }, noteMark: { color: palette.blueLight, fontSize: 19 }, noteText: { flex: 1, color: "#D4D7E9", fontSize: 11, lineHeight: 17 },
});
