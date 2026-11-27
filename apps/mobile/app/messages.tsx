import { useState } from "react";
import { ImageBackground, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AppFrame, Eyebrow, PreviewTag, SectionTitle, palette, ui } from "../components/app-ui";

const contacts = [
  { id: "ananya", name: "Ananya Mehta", place: "Bengaluru · Indiranagar", message: "That sounds lovely, shall we plan a visit?", time: "2m", initial: "A", online: true, photo: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=180&q=75" },
  { id: "rohan", name: "Rohan Iyer", place: "Pune · Baner", message: "I’m also looking near the metro.", time: "1h", initial: "R", online: false, photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=180&q=75" },
  { id: "mira", name: "Mira Shah", place: "Mumbai · Powai", message: "Thanks for the intro!", time: "1d", initial: "M", online: true, photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=180&q=75" },
];

export default function Messages() {
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState<string[]>([]);
  const [attachmentNotice, setAttachmentNotice] = useState(false);
  const contact = contacts.find((item) => item.id === selected);

  function sendMessage() {
    if (!message.trim()) return;
    setSent((current) => [...current, message.trim()]);
    setMessage("");
  }

  return (
    <AppFrame active="Messages">
      <View style={styles.heading}><Eyebrow>YOUR CONNECTIONS</Eyebrow><Text style={ui.heading}>{contact ? contact.name : "Messages & matches"}</Text><Text style={ui.subheading}>Get to know your future flatmates, one conversation at a time.</Text></View>
      <PreviewTag>CONVERSATION PREVIEW</PreviewTag>
      {contact ? (
        <View style={styles.chatCard}>
          <Pressable accessibilityRole="button" onPress={() => setSelected(null)} style={styles.back}><Text style={styles.backText}>←  All messages</Text></Pressable>
          <View style={styles.chatHeader}><ImageBackground accessibilityLabel={`Sample profile portrait for ${contact.name}`} source={{ uri: contact.photo }} imageStyle={styles.avatarImage} style={styles.avatar}><View style={styles.avatarShade} /><Text style={styles.avatarText}>{contact.initial}</Text><View style={[styles.online, !contact.online && styles.offline]} /></ImageBackground><View style={{ flex: 1 }}><Text style={styles.name}>{contact.name}</Text><Text style={ui.muted}>{contact.online ? "Online · sample status" : "Recently active · sample"}</Text></View><Text style={styles.matchBadge}>MATCH</Text></View>
          <View style={styles.chatSpace}><Text style={styles.date}>TODAY · SAMPLE CHAT</Text><View style={styles.incoming}><Text style={styles.bubbleText}>Hi! I saw we’re both looking around {contact.place.split("·")[0].trim()}. What kind of home are you hoping to find?</Text></View><View style={styles.outgoing}><Text style={styles.bubbleText}>A bright shared place with a friendly, considerate vibe. How about you?</Text></View><View style={styles.incoming}><Text style={styles.bubbleText}>{contact.message}</Text></View>{sent.map((item, index) => <View key={`${item}-${index}`} style={styles.outgoing}><Text style={styles.bubbleText}>{item}</Text></View>)}</View>
          <View style={styles.composer}><Pressable accessibilityRole="button" accessibilityLabel="Attach image" onPress={() => setAttachmentNotice((value) => !value)} style={styles.attach}><Text style={styles.attachText}>＋</Text></Pressable><TextInput accessibilityLabel="Write a message" placeholder="Write a message…" placeholderTextColor="#A1A1AA" value={message} onChangeText={setMessage} onSubmitEditing={sendMessage} style={styles.input} /><Pressable accessibilityRole="button" accessibilityLabel="Send message" onPress={sendMessage} style={styles.send}><Text style={styles.sendText}>↑</Text></Pressable></View>
          {attachmentNotice ? <Text style={styles.disclaimer}>Image sharing is shown as a preview; no file is selected or sent.</Text> : null}
          <Text style={styles.disclaimer}>Messages are a local preview and are not sent or stored.</Text>
        </View>
      ) : (
        <>
          <View style={styles.matchCard}><View style={styles.matchSymbol}><Text style={styles.matchSymbolText}>✦</Text></View><View style={{ flex: 1 }}><Text style={styles.matchTitle}>You have a new match!</Text><Text style={ui.muted}>A mutual like is the beginning of a good conversation.</Text></View><Text style={styles.matchArrow}>↗</Text></View>
          <SectionTitle title="Recent conversations" action="3 chats" />
          {contacts.map((item, index) => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`Open sample chat with ${item.name}`} onPress={() => setSelected(item.id)} style={styles.thread}><ImageBackground accessibilityLabel={`Sample profile portrait for ${item.name}`} source={{ uri: item.photo }} imageStyle={styles.avatarImage} style={styles.avatar}><View style={styles.avatarShade} /><Text style={styles.avatarText}>{item.initial}</Text><View style={[styles.online, !item.online && styles.offline]} /></ImageBackground><View style={styles.threadBody}><View style={styles.threadTop}><Text style={styles.name}>{item.name}</Text><Text style={styles.time}>{item.time}</Text></View><Text style={styles.place}>{item.place} · sample</Text><Text numberOfLines={1} style={styles.lastMessage}>{item.message}</Text></View><Text style={styles.chevron}>›</Text></Pressable>)}
          <View style={styles.safety}><Text style={styles.safetyTitle}>Meet thoughtfully</Text><Text style={ui.muted}>Keep early conversations in the app and meet in a public place. Report and block tools are coming in a future release.</Text></View>
        </>
      )}
    </AppFrame>
  );
}

const styles = StyleSheet.create({
  heading: { gap: 5 }, matchCard: { flexDirection: "row", alignItems: "center", gap: 13, padding: 16, borderWidth: 1, borderColor: "rgba(82,109,255,0.35)", borderRadius: 20, backgroundColor: "#171A2B" }, matchSymbol: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 15, backgroundColor: palette.blue }, matchSymbolText: { color: palette.white, fontSize: 22 }, matchTitle: { marginBottom: 4, color: palette.white, fontSize: 14, fontWeight: "900" }, matchArrow: { color: palette.blueLight, fontSize: 20 },
  thread: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: palette.line }, avatar: { position: "relative", width: 49, height: 49, alignItems: "center", justifyContent: "center", overflow: "hidden", borderWidth: 1, borderColor: "rgba(82,109,255,0.5)", borderRadius: 25, backgroundColor: "#20243A" }, avatarImage: { borderRadius: 25 }, avatarShade: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.25)" }, avatarText: { color: palette.white, fontSize: 17, fontWeight: "800" }, online: { position: "absolute", right: 0, bottom: 0, width: 12, height: 12, borderWidth: 2, borderColor: palette.background, borderRadius: 7, backgroundColor: palette.success }, offline: { backgroundColor: "#71717A" }, threadBody: { flex: 1, gap: 3 }, threadTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, name: { color: palette.white, fontSize: 13, fontWeight: "800" }, time: { color: palette.muted, fontSize: 10 }, place: { color: palette.blueLight, fontSize: 9 }, lastMessage: { color: palette.muted, fontSize: 11 }, chevron: { color: palette.muted, fontSize: 25 },
  safety: { gap: 6, marginTop: 14, padding: 16, borderWidth: 1, borderColor: palette.line, borderRadius: 18, backgroundColor: palette.card }, safetyTitle: { color: palette.white, fontSize: 13, fontWeight: "800" }, chatCard: { padding: 15, borderWidth: 1, borderColor: palette.line, borderRadius: 22, backgroundColor: palette.card }, back: { alignSelf: "flex-start", marginBottom: 15 }, backText: { color: palette.blueLight, fontSize: 12, fontWeight: "800" }, chatHeader: { flexDirection: "row", alignItems: "center", gap: 11, paddingBottom: 13, borderBottomWidth: 1, borderBottomColor: palette.line }, matchBadge: { color: palette.yellow, fontSize: 9, fontWeight: "900", letterSpacing: 1 }, chatSpace: { gap: 12, paddingVertical: 16 }, date: { alignSelf: "center", marginBottom: 4, color: palette.muted, fontSize: 8, letterSpacing: 1 }, incoming: { alignSelf: "flex-start", maxWidth: "88%", padding: 12, borderRadius: 15, borderBottomLeftRadius: 5, backgroundColor: "#27272A" }, outgoing: { alignSelf: "flex-end", maxWidth: "88%", padding: 12, borderRadius: 15, borderBottomRightRadius: 5, backgroundColor: palette.blue }, bubbleText: { color: palette.white, fontSize: 12, lineHeight: 18 }, composer: { flexDirection: "row", alignItems: "center", gap: 8, padding: 6, borderWidth: 1, borderColor: palette.line, borderRadius: 16, backgroundColor: "#0F0F10" }, attach: { width: 34, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 11, backgroundColor: "#222226" }, attachText: { color: palette.blueLight, fontSize: 21 }, input: { flex: 1, paddingHorizontal: 9, color: palette.white, fontSize: 12 }, send: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: palette.blue }, sendText: { color: palette.white, fontSize: 21, fontWeight: "800" }, disclaimer: { marginTop: 9, color: "#85858D", fontSize: 9, textAlign: "center" },
});
