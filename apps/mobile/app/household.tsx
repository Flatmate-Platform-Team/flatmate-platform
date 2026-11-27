import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ActionButton, AppFrame, Eyebrow, PreviewTag, SectionTitle, palette, ui } from "../components/app-ui";

const initialExpenses = [
  { name: "Rent", category: "HOUSING", amount: 18000, icon: "⌂", tint: "#304FFE" },
  { name: "Electricity", category: "UTILITIES", amount: 2000, icon: "ϟ", tint: "#6551D9" },
  { name: "Wi-Fi", category: "UTILITIES", amount: 999, icon: "⌁", tint: "#277EAA" },
  { name: "Groceries", category: "SHARED", amount: 4500, icon: "◉", tint: "#AD6A31" },
];
const initialChores = ["Kitchen reset · Ananya", "Living room · Rohan", "Take out recycling · You", "Bathroom refresh · Mira"];

export default function Household() {
  const router = useRouter();
  const [view, setView] = useState<"expenses" | "chores">("expenses");
  const [expenses, setExpenses] = useState(initialExpenses);
  const [chores, setChores] = useState(initialChores);
  const [done, setDone] = useState<number[]>([1]);
  const [showHistory, setShowHistory] = useState(false);
  const [splitMessage, setSplitMessage] = useState("");
  const total = expenses.reduce((sum, item) => sum + item.amount, 0);
  const doneCount = done.length;

  function addExpense() { setExpenses((current) => [...current, { name: "Household supplies", category: "SHARED", amount: 500, icon: "+", tint: "#277EAA" }]); }
  function toggleChore(index: number) { setDone((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index]); }
  function addChore() { setChores((current) => [...current, "Wipe kitchen counters · You"]); }

  return (
    <AppFrame active="Household">
      <View style={styles.heading}><Eyebrow>YOUR SHARED HOME</Eyebrow><Text style={ui.heading}>A home that{ "\n" }runs smoothly.</Text><Text style={ui.subheading}>Keep the little things in sync, together.</Text></View>
      <PreviewTag>LOCAL PROTOTYPE · NOT SYNCED</PreviewTag>
      <View style={styles.switcher}>
        <Pressable accessibilityRole="tab" accessibilityState={{ selected: view === "expenses" }} onPress={() => setView("expenses")} style={[styles.switchTab, view === "expenses" && styles.switchActive]}><Text style={[styles.switchText, view === "expenses" && styles.switchTextActive]}>Splitmate · expenses</Text></Pressable>
        <Pressable accessibilityRole="tab" accessibilityState={{ selected: view === "chores" }} onPress={() => setView("chores")} style={[styles.switchTab, view === "chores" && styles.switchActive]}><Text style={[styles.switchText, view === "chores" && styles.switchTextActive]}>ChoreMate · tasks</Text></Pressable>
      </View>

      {view === "expenses" ? (
        <>
          <View style={styles.balanceCard}>
            <View style={styles.balanceOrb} /><Text style={styles.balanceEyebrow}>TOTAL HOUSEHOLD EXPENSES</Text>
            <Text style={styles.total}>₹{total.toLocaleString("en-IN")}</Text>
            <Text style={styles.period}>This month · example household</Text>
            <View style={styles.balanceStats}>
              <View style={styles.balanceStat}><Text style={styles.statLabel}>YOUR CONTRIBUTION</Text><Text style={styles.statValue}>₹7,125</Text></View>
              <View style={styles.statRule} />
              <View style={styles.balanceStat}><Text style={styles.statLabel}>PENDING</Text><Text style={[styles.statValue, styles.yellow]}>₹2,000</Text></View>
            </View>
          </View>
          <View style={styles.actions}><ActionButton label="＋ Add expense" onPress={addExpense} /><ActionButton label="Split expense" secondary onPress={() => setSplitMessage(`₹${total.toLocaleString("en-IN")} split across 4 members = ₹${Math.round(total / 4).toLocaleString("en-IN")} each (sample calculation).`)} /></View>
          {splitMessage ? <View style={styles.feedback}><Text style={styles.feedbackText}>{splitMessage}</Text></View> : null}
          <SectionTitle title="Shared expenses" action="View history" onAction={() => setShowHistory((value) => !value)} />
          <View style={styles.listCard}>{expenses.map((expense, index) => <View key={`${expense.name}-${index}`} style={[styles.expenseRow, index < expenses.length - 1 && styles.rowBorder]}><View style={[styles.expenseIcon, { backgroundColor: expense.tint }]}><Text style={styles.expenseSymbol}>{expense.icon}</Text></View><View style={styles.expenseInfo}><Text style={styles.expenseName}>{expense.name}</Text><Text style={styles.expenseCategory}>{expense.category} · SAMPLE</Text></View><Text style={styles.expenseAmount}>₹{expense.amount.toLocaleString("en-IN")}</Text></View>)}</View>
          {showHistory ? <View style={styles.history}><Text style={styles.historyTitle}>Recent activity</Text><Text style={ui.muted}>Today · Shared groceries · ₹4,500 (sample)</Text><Text style={ui.muted}>Yesterday · Electricity · ₹2,000 (sample)</Text></View> : null}
          <SectionTitle title="Member balances" />
          <View style={styles.memberRow}>{["You", "Ananya", "Rohan", "Mira"].map((member, index) => <View key={member} style={styles.member}><View style={styles.memberAvatar}><Text style={styles.memberInitial}>{member[0]}</Text></View><Text style={styles.memberName}>{member}</Text><Text style={index === 0 ? styles.paid : styles.owes}>{index === 0 ? "Settled" : "₹2,000 due"}</Text></View>)}</View>
        </>
      ) : (
        <>
          <View style={styles.choreSummary}><View><Text style={styles.choreSummaryLabel}>THIS WEEK</Text><Text style={styles.choreSummaryTitle}>{doneCount} of {chores.length} tasks done</Text></View><Text style={styles.chorePercent}>{chores.length ? Math.round(doneCount / chores.length * 100) : 0}%</Text><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${chores.length ? doneCount / chores.length * 100 : 0}%` }]} /></View></View>
          <SectionTitle title="Weekly cleaning schedule" action="＋ Add task" onAction={addChore} />
          <View style={styles.listCard}>{chores.map((task, index) => <Pressable key={`${task}-${index}`} accessibilityRole="checkbox" accessibilityState={{ checked: done.includes(index) }} onPress={() => toggleChore(index)} style={[styles.choreRow, index < chores.length - 1 && styles.rowBorder]}><View style={[styles.checkbox, done.includes(index) && styles.checkboxDone]}><Text style={styles.check}>{done.includes(index) ? "✓" : ""}</Text></View><View style={{ flex: 1 }}><Text style={[styles.choreName, done.includes(index) && styles.choreComplete]}>{task.split(" · ")[0]}</Text><Text style={styles.expenseCategory}>ASSIGNED TO {task.split(" · ")[1].toUpperCase()}</Text></View><Text style={styles.choreDay}>{["MON", "TUE", "WED", "SAT"][index % 4]}</Text></Pressable>)}</View>
          <View style={styles.reminder}><Text style={styles.reminderIcon}>◷</Text><View style={{ flex: 1 }}><Text style={styles.historyTitle}>Gentle reminder</Text><Text style={ui.muted}>A quick kitchen reset is planned for tomorrow.</Text></View></View>
        </>
      )}

      <SectionTitle title="Make it official" />
      <View style={styles.quickLinks}>
        <Pressable accessibilityRole="button" onPress={() => router.push("/agreement")} style={styles.quickLink}><Text style={styles.quickIcon}>▤</Text><Text style={styles.quickTitle}>Roommate agreement</Text><Text style={styles.quickCopy}>Shared expectations, in one place</Text><Text style={styles.quickArrow}>↗</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.push("/trustscore")} style={styles.quickLink}><Text style={styles.quickIcon}>✳</Text><Text style={styles.quickTitle}>Trust & safety</Text><Text style={styles.quickCopy}>See what’s verified</Text><Text style={styles.quickArrow}>↗</Text></Pressable>
      </View>
      <Pressable accessibilityRole="button" onPress={() => router.push("/personality")} style={styles.personalityLink}><Text style={styles.personalityTitle}>Get to know your home style</Text><Text style={styles.personalityCopy}>Take the lifestyle compatibility check →</Text></Pressable>
      <Text style={styles.disclaimer}>All amounts, members, and tasks above are example data. Nothing is charged, shared, or saved.</Text>
    </AppFrame>
  );
}

const styles = StyleSheet.create({
  heading: { gap: 5 }, switcher: { flexDirection: "row", gap: 5, padding: 5, borderWidth: 1, borderColor: palette.line, borderRadius: 17, backgroundColor: palette.card }, switchTab: { flex: 1, minHeight: 43, alignItems: "center", justifyContent: "center", paddingHorizontal: 6, borderRadius: 12 }, switchActive: { backgroundColor: palette.blue }, switchText: { color: palette.muted, fontSize: 10, fontWeight: "700" }, switchTextActive: { color: palette.white },
  balanceCard: { position: "relative", overflow: "hidden", padding: 20, borderRadius: 23, backgroundColor: palette.blue }, balanceOrb: { position: "absolute", top: -68, right: -40, width: 185, height: 185, borderWidth: 1, borderColor: "rgba(255,255,255,0.17)", borderRadius: 93, backgroundColor: "rgba(82,109,255,0.55)" }, balanceEyebrow: { color: "#E4E7FF", fontSize: 9, fontWeight: "900", letterSpacing: 1.3 }, total: { marginTop: 8, color: palette.white, fontSize: 39, fontWeight: "900", letterSpacing: -1.5 }, period: { marginTop: 2, color: "#E4E7FF", fontSize: 11 }, balanceStats: { flexDirection: "row", alignItems: "center", gap: 17, marginTop: 21, paddingTop: 15, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.24)" }, balanceStat: { flex: 1, gap: 6 }, statLabel: { color: "#E4E7FF", fontSize: 8, fontWeight: "900", letterSpacing: 0.7 }, statValue: { color: palette.white, fontSize: 17, fontWeight: "900" }, yellow: { color: palette.yellow }, statRule: { width: 1, height: 36, backgroundColor: "rgba(255,255,255,0.25)" }, actions: { gap: 9 }, feedback: { padding: 13, borderWidth: 1, borderColor: "rgba(232,255,0,0.22)", borderRadius: 14, backgroundColor: "rgba(232,255,0,0.06)" }, feedbackText: { color: palette.yellow, fontSize: 11, lineHeight: 17 },
  listCard: { overflow: "hidden", borderWidth: 1, borderColor: palette.line, borderRadius: 20, backgroundColor: palette.card }, expenseRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 14 }, rowBorder: { borderBottomWidth: 1, borderBottomColor: palette.line }, expenseIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 14 }, expenseSymbol: { color: palette.white, fontSize: 18, fontWeight: "900" }, expenseInfo: { flex: 1, gap: 3 }, expenseName: { color: palette.white, fontSize: 13, fontWeight: "800" }, expenseCategory: { color: palette.muted, fontSize: 8, fontWeight: "800", letterSpacing: 0.8 }, expenseAmount: { color: palette.white, fontSize: 14, fontWeight: "900" }, history: { gap: 8, padding: 15, borderWidth: 1, borderColor: palette.line, borderRadius: 17, backgroundColor: "#101010" }, historyTitle: { color: palette.white, fontSize: 13, fontWeight: "800" }, memberRow: { flexDirection: "row", justifyContent: "space-between", gap: 4 }, member: { alignItems: "center", gap: 5 }, memberAvatar: { width: 39, height: 39, alignItems: "center", justifyContent: "center", borderRadius: 20, backgroundColor: "#242424" }, memberInitial: { color: palette.white, fontWeight: "800" }, memberName: { color: palette.white, fontSize: 9, fontWeight: "700" }, paid: { color: palette.success, fontSize: 8 }, owes: { color: palette.yellow, fontSize: 8 },
  choreSummary: { position: "relative", gap: 6, padding: 17, borderWidth: 1, borderColor: palette.line, borderRadius: 20, backgroundColor: palette.card }, choreSummaryLabel: { color: palette.blueLight, fontSize: 9, fontWeight: "900", letterSpacing: 1 }, choreSummaryTitle: { marginTop: 5, color: palette.white, fontSize: 17, fontWeight: "800" }, chorePercent: { position: "absolute", top: 17, right: 18, color: palette.yellow, fontSize: 24, fontWeight: "900" }, progressTrack: { height: 7, marginTop: 5, overflow: "hidden", borderRadius: 4, backgroundColor: "#303033" }, progressFill: { height: 7, borderRadius: 4, backgroundColor: palette.blueLight }, choreRow: { minHeight: 66, flexDirection: "row", alignItems: "center", gap: 11, paddingHorizontal: 13 }, checkbox: { width: 23, height: 23, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#63636B", borderRadius: 8 }, checkboxDone: { borderColor: palette.blue, backgroundColor: palette.blue }, check: { color: palette.white, fontSize: 13, fontWeight: "900" }, choreName: { color: palette.white, fontSize: 12, fontWeight: "800" }, choreComplete: { color: palette.muted, textDecorationLine: "line-through" }, choreDay: { color: palette.muted, fontSize: 9, fontWeight: "900" }, reminder: { flexDirection: "row", alignItems: "center", gap: 12, padding: 15, borderWidth: 1, borderColor: palette.line, borderRadius: 17, backgroundColor: palette.card }, reminderIcon: { color: palette.yellow, fontSize: 22 },
  quickLinks: { flexDirection: "row", gap: 10 }, quickLink: { position: "relative", flex: 1, minHeight: 135, justifyContent: "flex-end", gap: 6, padding: 13, borderWidth: 1, borderColor: palette.line, borderRadius: 19, backgroundColor: palette.card }, quickIcon: { position: "absolute", top: 13, left: 13, color: palette.blueLight, fontSize: 21 }, quickTitle: { color: palette.white, fontSize: 11, fontWeight: "800" }, quickCopy: { color: palette.muted, fontSize: 9, lineHeight: 14 }, quickArrow: { position: "absolute", top: 14, right: 13, color: palette.yellow, fontSize: 15 }, personalityLink: { gap: 5, padding: 16, borderWidth: 1, borderColor: "rgba(82,109,255,0.3)", borderRadius: 18, backgroundColor: "#171A2B" }, personalityTitle: { color: palette.white, fontSize: 13, fontWeight: "800" }, personalityCopy: { color: palette.blueLight, fontSize: 11, fontWeight: "700" }, disclaimer: { color: "#85858D", fontSize: 9, lineHeight: 14, textAlign: "center" },
});
