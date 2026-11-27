import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppFrame, Eyebrow, PreviewTag, palette, ui } from "../components/app-ui";

const terms = [
  ["Monthly rent sharing", "Agree how rent is divided and when each share is due."],
  ["Cleaning responsibilities", "Set a fair rota for shared spaces and weekly tasks."],
  ["Guest policies", "Discuss advance notice, overnight guests, and shared areas."],
  ["Quiet hours", "Choose hours that respect everyone’s sleep and work routines."],
  ["Shared expenses", "Decide how utilities and household purchases are recorded."],
  ["Move-in and move-out", "Record the intended dates and notice expectations."],
];

export default function Agreement() {
  const [acknowledged, setAcknowledged] = useState<number[]>([]);
  const [notice, setNotice] = useState(false);
  return (
    <AppFrame active="Household">
      <View style={styles.heading}><Eyebrow>ROOMMATE AGREEMENT</Eyebrow><Text style={ui.heading}>Start with{ "\n" }shared expectations.</Text><Text style={ui.subheading}>A clear conversation can make the everyday feel easier.</Text></View>
      <PreviewTag>DEMO TEMPLATE · NOT A LEGAL AGREEMENT</PreviewTag>
      <View style={styles.details}><Detail label="MONTHLY RENT SHARE" value="₹7,125 each · sample" /><Detail label="MOVE-IN DATE" value="To be agreed" /><Detail label="MOVE-OUT DATE" value="To be agreed" /><Detail label="HOUSEHOLD MEMBERS" value="4 · sample household" /></View>
      <Text style={styles.sectionHeading}>Talk through these together</Text>
      <View style={styles.terms}>{terms.map(([title, description], index) => <Pressable key={title} accessibilityRole="checkbox" accessibilityState={{ checked: acknowledged.includes(index) }} onPress={() => setAcknowledged((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index])} style={styles.term}><View style={[styles.checkbox, acknowledged.includes(index) && styles.checked]}><Text style={styles.check}>{acknowledged.includes(index) ? "✓" : ""}</Text></View><View style={{ flex: 1 }}><Text style={styles.termTitle}>{title}</Text><Text style={ui.muted}>{description}</Text></View></Pressable>)}</View>
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: acknowledged.length < terms.length }} disabled={acknowledged.length < terms.length} onPress={() => setNotice(true)} style={[styles.confirm, acknowledged.length < terms.length && styles.confirmMuted]}><Text style={styles.confirmText}>Acknowledge preview</Text></Pressable>
      {notice ? <Text accessibilityRole="status" style={styles.notice}>Thanks. This acknowledgement is local to this preview and is not signed, shared, or legally binding.</Text> : null}
      <Text style={styles.disclaimer}>No agreement, signature, date, or member acknowledgement is stored by this prototype.</Text>
    </AppFrame>
  );
}

function Detail({ label, value }: { label: string; value: string }) { return <View style={styles.detail}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>; }

const styles = StyleSheet.create({
  heading: { gap: 5 }, details: { flexDirection: "row", flexWrap: "wrap", gap: 9 }, detail: { width: "48%", minHeight: 83, justifyContent: "center", gap: 7, padding: 12, borderWidth: 1, borderColor: palette.line, borderRadius: 17, backgroundColor: palette.card }, detailLabel: { color: palette.blueLight, fontSize: 8, fontWeight: "900", letterSpacing: 0.8 }, detailValue: { color: palette.white, fontSize: 11, fontWeight: "800" }, sectionHeading: { color: palette.white, fontSize: 17, fontWeight: "900" }, terms: { paddingHorizontal: 14, borderWidth: 1, borderColor: palette.line, borderRadius: 20, backgroundColor: palette.card }, term: { flexDirection: "row", alignItems: "flex-start", gap: 11, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: palette.line }, checkbox: { width: 21, height: 21, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#71717A", borderRadius: 7 }, checked: { borderColor: palette.blue, backgroundColor: palette.blue }, check: { color: palette.white, fontSize: 12, fontWeight: "900" }, termTitle: { marginBottom: 4, color: palette.white, fontSize: 12, fontWeight: "800" }, confirm: { minHeight: 48, alignItems: "center", justifyContent: "center", borderRadius: 15, backgroundColor: palette.blue }, confirmMuted: { opacity: 0.85 }, confirmText: { color: palette.white, fontSize: 12, fontWeight: "900" }, notice: { color: palette.yellow, fontSize: 10, lineHeight: 15 }, disclaimer: { color: "#85858D", fontSize: 9, lineHeight: 14, textAlign: "center" },
});
