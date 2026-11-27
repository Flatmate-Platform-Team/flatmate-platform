import { useState } from "react";
import { ImageBackground, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AppFrame, Eyebrow, PreviewTag, palette, ui } from "../components/app-ui";

const storyData = [
  { name: "Ananya", area: "Indiranagar, Bengaluru", caption: "Sunday light in our shared living room.", photo: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1100&q=85" },
  { name: "Rohan", area: "Baner, Pune", caption: "Our favourite corner for a slow morning.", photo: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1100&q=85" },
  { name: "Mira", area: "Powai, Mumbai", caption: "Room tour: plants, books, and a little sunshine.", photo: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1100&q=85" },
];

export default function Stories() {
  const [index, setIndex] = useState(0);
  const [reaction, setReaction] = useState("");
  const [reply, setReply] = useState("");
  const [replies, setReplies] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const story = storyData[index];
  function next() { setIndex((current) => (current + 1) % storyData.length); setReaction(""); setNotice(""); }
  function addReply() { if (reply.trim()) { setReplies((current) => [...current, reply.trim()]); setReply(""); } }

  return (
    <AppFrame active="Discover">
      <View style={styles.heading}><Eyebrow>ROOMMATE STORIES</Eyebrow><Text style={ui.heading}>See life at home,{ "\n" }through their eyes.</Text><Text style={ui.subheading}>Room tours, little rituals, and the places people love.</Text></View>
      <PreviewTag>SAMPLE STORY PREVIEW</PreviewTag>
      <View style={styles.storyTabs}>{storyData.map((item, itemIndex) => <Pressable key={item.name} accessibilityRole="tab" accessibilityState={{ selected: index === itemIndex }} onPress={() => { setIndex(itemIndex); setReaction(""); }} style={[styles.storyTab, index === itemIndex && styles.activeTab]}><Text style={[styles.storyTabText, index === itemIndex && styles.activeTabText]}>{item.name}</Text></Pressable>)}</View>
      <ImageBackground source={{ uri: story.photo }} imageStyle={styles.storyImage} style={styles.storyCard}>
        <View style={styles.storyShade} />
        <View style={styles.storyTop}><Text style={styles.storyProgress}>{storyData.map((_, itemIndex) => <Text key={itemIndex} style={itemIndex <= index ? styles.progressOn : styles.progressOff}>━━━━</Text>)}</Text><Text style={styles.storyFlag}>SAMPLE</Text></View>
        <View style={styles.storyBottom}><Text style={styles.storyName}>{story.name}</Text><Text style={styles.storyArea}>{story.area} · sample location</Text><Text style={styles.caption}>{story.caption}</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Next story" onPress={next} style={styles.nextArea} />
      </ImageBackground>
      <View style={styles.reactionRow}><Text style={styles.reactionLabel}>Send a reaction</Text>{["♥", "☺", "✦", "👏"].map((emoji) => <Pressable key={emoji} accessibilityRole="button" accessibilityLabel={`React with ${emoji}`} accessibilityState={{ selected: reaction === emoji }} onPress={() => setReaction(emoji)} style={[styles.reaction, reaction === emoji && styles.reactionActive]}><Text style={styles.emoji}>{emoji}</Text></Pressable>)}</View>
      <View style={styles.replyBox}><TextInput accessibilityLabel="Reply to sample story" placeholder="Reply to this story…" placeholderTextColor="#85858D" value={reply} onChangeText={setReply} onSubmitEditing={addReply} style={styles.replyInput} /><Pressable accessibilityRole="button" onPress={addReply} style={styles.send}><Text style={styles.sendText}>↑</Text></Pressable></View>
      {reaction ? <Text style={styles.notice}>Reaction {reaction} added to this local preview.</Text> : null}{replies.map((item, itemIndex) => <Text key={`${item}-${itemIndex}`} style={styles.replyPreview}>You · {item}</Text>)}{notice ? <Text style={styles.notice}>{notice}</Text> : null}
      <Pressable accessibilityRole="button" onPress={() => setNotice("Story sharing is a design preview. Upload and publishing are not connected.")} style={styles.addStory}><Text style={styles.addStoryText}>＋  Add your story</Text></Pressable>
      <Text style={styles.disclaimer}>Stories, replies, and reactions stay on this screen only. Short video playback and publishing are not connected.</Text>
    </AppFrame>
  );
}

const styles = StyleSheet.create({
  heading: { gap: 5 }, storyTabs: { flexDirection: "row", gap: 8 }, storyTab: { flex: 1, minHeight: 39, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: palette.line, borderRadius: 13, backgroundColor: palette.card }, activeTab: { borderColor: "rgba(82,109,255,0.5)", backgroundColor: "rgba(48,79,254,0.19)" }, storyTabText: { color: palette.muted, fontSize: 11, fontWeight: "700" }, activeTabText: { color: palette.white }, storyCard: { height: 430, justifyContent: "space-between", overflow: "hidden", padding: 15, borderRadius: 24, backgroundColor: "#252525" }, storyImage: { borderRadius: 24, opacity: 0.83 }, storyShade: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.3)" }, storyTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, storyProgress: { flexDirection: "row", gap: 4 }, progressOn: { color: palette.white, fontSize: 9 }, progressOff: { color: "rgba(255,255,255,0.4)", fontSize: 9 }, storyFlag: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 99, backgroundColor: "rgba(8,8,8,0.65)", color: palette.yellow, fontSize: 8, fontWeight: "900", letterSpacing: 0.8 }, storyBottom: { zIndex: 1, gap: 5 }, storyName: { color: palette.white, fontSize: 24, fontWeight: "900" }, storyArea: { color: "#E4E4E7", fontSize: 10 }, caption: { marginTop: 5, color: palette.white, fontSize: 13, lineHeight: 19 }, nextArea: { position: "absolute", top: 54, right: 0, bottom: 0, width: "28%" }, reactionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 7 }, reactionLabel: { color: palette.muted, fontSize: 10 }, reaction: { width: 37, height: 37, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: palette.line, borderRadius: 19, backgroundColor: palette.card }, reactionActive: { borderColor: palette.blueLight, backgroundColor: "rgba(48,79,254,0.25)" }, emoji: { color: palette.white, fontSize: 17 }, replyBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 6, borderWidth: 1, borderColor: palette.line, borderRadius: 16, backgroundColor: palette.card }, replyInput: { flex: 1, paddingHorizontal: 10, color: palette.white, fontSize: 12 }, send: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: palette.blue }, sendText: { color: palette.white, fontSize: 19, fontWeight: "900" }, notice: { color: palette.yellow, fontSize: 10 }, replyPreview: { color: palette.muted, fontSize: 10 }, addStory: { minHeight: 44, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(232,255,0,0.25)", borderRadius: 15, backgroundColor: "rgba(232,255,0,0.06)" }, addStoryText: { color: palette.yellow, fontSize: 12, fontWeight: "800" }, disclaimer: { color: "#85858D", fontSize: 9, lineHeight: 14, textAlign: "center" },
});
