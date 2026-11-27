import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { ActionButton, AppFrame, Eyebrow, PreviewTag, SectionTitle, palette, ui } from "../components/app-ui";
import { getSignedInUser, signOut } from "../lib/auth";
import type { MobileUser } from "../lib/auth";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<MobileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [city, setCity] = useState("");
  const [about, setAbout] = useState("");
  const [budget, setBudget] = useState("");
  const [saved, setSaved] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => { getSignedInUser().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false)); }, []);
  const name = user?.displayName ?? "Your profile";

  async function leave() { setSigningOut(true); await signOut(); router.replace("/"); }

  return (
    <AppFrame active="Profile">
      <View style={styles.heading}><Eyebrow>YOUR AVENLI PROFILE</Eyebrow><Text style={ui.heading}>A little more{ "\n" }about you.</Text><Text style={ui.subheading}>Help future flatmates understand what living together could feel like.</Text></View>
      {loading ? <ActivityIndicator color={palette.blueLight} /> : null}
      <PreviewTag>PROFILE DETAILS FROM YOUR SIGN-IN</PreviewTag>
      <View style={styles.profileCard}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{name.trim().charAt(0).toUpperCase()}</Text><Text style={styles.avatarEdit}>＋</Text></View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{user?.email ?? "Sign in to see your profile"}</Text>
        <View style={styles.badges}><View style={styles.badge}><Text style={styles.badgeText}>EMAIL · STATUS NOT PROVIDED</Text></View><View style={styles.badge}><Text style={styles.badgeText}>IDENTITY · NOT VERIFIED</Text></View></View>
      </View>

      <View style={styles.detailCard}>
        <View style={styles.detailHeader}><SectionTitle title="Your flatmate profile" /><Pressable accessibilityRole="button" onPress={() => { setEditing((value) => !value); setSaved(false); }}><Text style={styles.editText}>{editing ? "Cancel" : "Edit profile"}</Text></Pressable></View>
        {editing ? (
          <View style={styles.form}>
            <Text style={styles.label}>Preferred city</Text><TextInput accessibilityLabel="Preferred city" value={city} onChangeText={setCity} placeholder="e.g. Bengaluru" placeholderTextColor="#A1A1AA" style={styles.input} />
            <Text style={styles.label}>Monthly budget (₹)</Text><TextInput accessibilityLabel="Monthly budget" value={budget} onChangeText={setBudget} keyboardType="number-pad" placeholder="e.g. 18000" placeholderTextColor="#A1A1AA" style={styles.input} />
            <Text style={styles.label}>About me</Text><TextInput accessibilityLabel="About me" value={about} onChangeText={setAbout} multiline placeholder="A bit about your routines and the home you want…" placeholderTextColor="#A1A1AA" style={[styles.input, styles.multiline]} />
            <ActionButton label="Save preview" onPress={() => { setSaved(true); setEditing(false); }} />
            {saved ? <Text accessibilityRole="status" style={styles.savedNotice}>Saved on this screen only. Profile sync will be available when the API supports these fields.</Text> : null}
          </View>
        ) : (
          <View style={styles.details}>
            <Detail label="Profession" value="Not added" /><Detail label="Preferred location" value={city || "Not added"} /><Detail label="Monthly budget" value={budget ? `₹${Number(budget).toLocaleString("en-IN")}` : "Not added"} /><Detail label="About me" value={about || "Add a bio to introduce yourself."} />
          </View>
        )}
      </View>

      <View>
        <SectionTitle title="Build a better match" />
        <Pressable accessibilityRole="button" onPress={() => router.push("/personality")} style={styles.linkCard}><Text style={styles.linkIcon}>✦</Text><View style={{ flex: 1 }}><Text style={styles.linkTitle}>Lifestyle compatibility</Text><Text style={ui.muted}>Share what matters in a home</Text></View><Text style={styles.arrow}>↗</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.push("/trustscore")} style={styles.linkCard}><Text style={styles.linkIcon}>◈</Text><View style={{ flex: 1 }}><Text style={styles.linkTitle}>Trust & verification</Text><Text style={ui.muted}>See current verification status</Text></View><Text style={styles.arrow}>↗</Text></Pressable>
      </View>
      <Pressable accessibilityRole="button" disabled={signingOut} onPress={() => void leave()} style={styles.signOut}><Text style={styles.signOutText}>{signingOut ? "Signing out…" : "Sign out"}</Text></Pressable>
      <Text style={styles.disclaimer}>We only show a verified badge when verification has actually been completed and recorded.</Text>
    </AppFrame>
  );
}

function Detail({ label, value }: { label: string; value: string }) { return <View style={styles.detail}><Text style={styles.label}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>; }

const styles = StyleSheet.create({
  heading: { gap: 5 }, profileCard: { alignItems: "center", padding: 22, borderWidth: 1, borderColor: palette.line, borderRadius: 23, backgroundColor: palette.card }, avatar: { position: "relative", width: 84, height: 84, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: palette.blueLight, borderRadius: 44, backgroundColor: "#20243A" }, avatarText: { color: palette.white, fontSize: 33, fontWeight: "900" }, avatarEdit: { position: "absolute", right: -4, bottom: -2, width: 25, height: 25, overflow: "hidden", borderWidth: 2, borderColor: palette.card, borderRadius: 14, backgroundColor: palette.blue, color: palette.white, textAlign: "center", textAlignVertical: "center", fontSize: 17 }, name: { marginTop: 14, color: palette.white, fontSize: 22, fontWeight: "900" }, email: { marginTop: 4, color: palette.muted, fontSize: 12 }, badges: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 7, marginTop: 14 }, badge: { paddingHorizontal: 9, paddingVertical: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", borderRadius: 99, backgroundColor: "#202020" }, badgeText: { color: palette.muted, fontSize: 7, fontWeight: "900", letterSpacing: 0.5 }, detailCard: { padding: 17, borderWidth: 1, borderColor: palette.line, borderRadius: 21, backgroundColor: palette.card }, detailHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, editText: { color: palette.yellow, fontSize: 11, fontWeight: "800" }, details: { gap: 14 }, detail: { gap: 4 }, label: { color: palette.muted, fontSize: 10, fontWeight: "800", letterSpacing: 0.5 }, detailValue: { color: palette.white, fontSize: 13, lineHeight: 19 }, form: { gap: 10 }, input: { minHeight: 45, paddingHorizontal: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.14)", borderRadius: 13, backgroundColor: "#0D0D0E", color: palette.white, fontSize: 13 }, multiline: { minHeight: 90, paddingTop: 12, textAlignVertical: "top" }, savedNotice: { color: palette.yellow, fontSize: 10, lineHeight: 15 }, linkCard: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 9, padding: 14, borderWidth: 1, borderColor: palette.line, borderRadius: 17, backgroundColor: palette.card }, linkIcon: { color: palette.blueLight, fontSize: 23 }, linkTitle: { marginBottom: 3, color: palette.white, fontSize: 12, fontWeight: "800" }, arrow: { color: palette.yellow, fontSize: 18 }, signOut: { minHeight: 46, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,138,128,0.28)", borderRadius: 15, backgroundColor: "rgba(255,138,128,0.055)" }, signOutText: { color: palette.danger, fontSize: 12, fontWeight: "800" }, disclaimer: { color: "#85858D", fontSize: 9, lineHeight: 14, textAlign: "center" },
});
