import type { ReactNode } from "react";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { getSignedInUser } from "../lib/auth";

export const palette = {
  background: "#080808",
  card: "#151515",
  blue: "#304FFE",
  blueLight: "#8798FF",
  yellow: "#E8FF00",
  white: "#FFFFFF",
  muted: "#A1A1AA",
  line: "rgba(255,255,255,0.1)",
  glass: "rgba(255,255,255,0.055)",
  danger: "#FF8A80",
  success: "#8FE3B0",
};

type AppRoute = "/home" | "/discover" | "/explore" | "/messages" | "/household" | "/profile" | "/trustscore" | "/personality" | "/agreement";
const tabs: { label: string; icon: string; route: AppRoute }[] = [
  { label: "Discover", icon: "⌂", route: "/home" },
  { label: "Explore", icon: "⌕", route: "/explore" },
  { label: "Messages", icon: "▤", route: "/messages" },
  { label: "Household", icon: "◫", route: "/household" },
  { label: "Profile", icon: "○", route: "/profile" },
];

export function AppFrame({ children, active = "Discover", onNotifications }: { children: ReactNode; active?: string; onNotifications?: () => void }) {
  const router = useRouter();
  useEffect(() => {
    let active = true;
    getSignedInUser().then((user) => { if (active && !user) router.replace("/"); }).catch(() => undefined);
    return () => { active = false; };
  }, [router]);
  return (
    <View style={styles.page}>
      <View pointerEvents="none" style={styles.glowBlue} />
      <View pointerEvents="none" style={styles.glowGold} />
      <View style={styles.topbar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Avenli home" onPress={() => router.replace("/home")}>
          <Text style={styles.brand}>avenli<Text style={styles.brandDot}>.</Text></Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Notifications and messages" onPress={onNotifications ?? (() => router.push("/messages"))} style={styles.notification}>
          <Text style={styles.notificationIcon}>◌</Text>
          <View style={styles.notificationDot} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
      <View style={styles.navShell} accessibilityRole="tablist">
        {tabs.map((tab) => {
          const selected = active === tab.label;
          return (
            <Pressable key={tab.label} accessibilityRole="tab" accessibilityState={{ selected }} onPress={() => router.replace(tab.route)} style={styles.navItem}>
              <View style={[styles.navIconWrap, selected && styles.navIconActive]}><Text style={[styles.navIcon, selected && styles.navIconSelected]}>{tab.icon}</Text></View>
              <Text style={[styles.navLabel, selected && styles.navLabelSelected]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Pressable accessibilityRole="button" onPress={onAction}><Text style={styles.sectionAction}>{action}</Text></Pressable> : null}
    </View>
  );
}

export function PreviewTag({ children = "PREVIEW DATA" }: { children?: ReactNode }) {
  return <View style={styles.previewTag}><Text style={styles.previewText}>{children}</Text></View>;
}

export function ActionButton({ label, onPress, secondary = false }: { label: string; onPress: () => void; secondary?: boolean }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.actionButton, secondary && styles.actionSecondary, pressed && styles.actionPressed]}>
      <Text style={[styles.actionText, secondary && styles.actionTextSecondary]}>{label}</Text>
    </Pressable>
  );
}

export const ui = StyleSheet.create({
  heading: { color: palette.white, fontSize: 30, lineHeight: 36, fontWeight: "900", letterSpacing: -1.2 },
  subheading: { marginTop: 8, color: palette.muted, fontSize: 14, lineHeight: 21 },
  card: { borderWidth: 1, borderColor: palette.line, borderRadius: 22, backgroundColor: palette.card, padding: 18 },
  glass: { borderWidth: 1, borderColor: "rgba(255,255,255,0.14)", borderRadius: 22, backgroundColor: palette.glass },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  body: { color: palette.white, fontSize: 14, lineHeight: 21 },
  muted: { color: palette.muted, fontSize: 12, lineHeight: 18 },
  smallLabel: { color: palette.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  blue: { color: palette.blueLight, fontWeight: "800" },
  yellow: { color: palette.yellow, fontWeight: "900" },
  divider: { height: 1, backgroundColor: palette.line },
});

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.background },
  glowBlue: { position: "absolute", top: -150, right: -130, width: 350, height: 350, borderRadius: 175, backgroundColor: "rgba(48,79,254,0.12)" },
  glowGold: { position: "absolute", bottom: 100, left: -210, width: 350, height: 350, borderRadius: 175, backgroundColor: "rgba(232,255,0,0.035)" },
  topbar: { height: 60, marginTop: 46, paddingHorizontal: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { color: palette.white, fontSize: 25, fontWeight: "900", letterSpacing: -1.2 },
  brandDot: { color: palette.blueLight },
  notification: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: palette.line, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.06)" },
  notificationIcon: { color: palette.white, fontSize: 19 },
  notificationDot: { position: "absolute", top: 9, right: 9, width: 6, height: 6, borderRadius: 3, backgroundColor: palette.yellow },
  content: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 130, gap: 22 },
  navShell: { position: "absolute", right: 14, bottom: 30, left: 14, height: 72, flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingHorizontal: 5, borderWidth: 1, borderColor: "rgba(255,255,255,0.16)", borderRadius: 24, backgroundColor: "rgba(20,20,22,0.94)", shadowColor: "#000", shadowOpacity: 0.45, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 16 },
  navItem: { minWidth: 55, alignItems: "center", justifyContent: "center", gap: 3 },
  navIconWrap: { width: 34, height: 30, alignItems: "center", justifyContent: "center", borderRadius: 12 },
  navIconActive: { backgroundColor: palette.blue },
  navIcon: { color: palette.muted, fontSize: 20, lineHeight: 24, fontWeight: "700" },
  navIconSelected: { color: palette.white },
  navLabel: { color: palette.muted, fontSize: 9, fontWeight: "600" },
  navLabelSelected: { color: palette.white },
  eyebrow: { color: palette.blueLight, fontSize: 10, fontWeight: "900", letterSpacing: 1.6 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 13 },
  sectionTitle: { color: palette.white, fontSize: 18, fontWeight: "800", letterSpacing: -0.35 },
  sectionAction: { color: palette.yellow, fontSize: 11, fontWeight: "800" },
  previewTag: { alignSelf: "flex-start", paddingHorizontal: 9, paddingVertical: 5, borderWidth: 1, borderColor: "rgba(232,255,0,0.27)", borderRadius: 99, backgroundColor: "rgba(232,255,0,0.08)" },
  previewText: { color: palette.yellow, fontSize: 8, fontWeight: "900", letterSpacing: 1 },
  actionButton: { minHeight: 46, alignItems: "center", justifyContent: "center", paddingHorizontal: 17, borderRadius: 15, backgroundColor: palette.blue, shadowColor: palette.blue, shadowOpacity: 0.3, shadowRadius: 15, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
  actionSecondary: { borderWidth: 1, borderColor: "rgba(255,255,255,0.16)", backgroundColor: "rgba(255,255,255,0.055)", shadowOpacity: 0, elevation: 0 },
  actionText: { color: palette.white, fontSize: 13, fontWeight: "800" },
  actionTextSecondary: { color: palette.white },
  actionPressed: { opacity: 0.86, transform: [{ scale: 0.98 }] },
});
