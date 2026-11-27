import { useEffect, useState } from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { AppFrame, ActionButton, Eyebrow, PreviewTag, SectionTitle, palette, ui } from "../components/app-ui";
import { getSignedInUser, mobileApiRequest } from "../lib/auth";

const flatmatePhoto = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85";
const apartmentPhoto = "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1100&q=85";
const bedroomPhoto = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85";
const storyPhotos = [
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=180&q=75",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=180&q=75",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=180&q=75",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=180&q=75",
];

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("there");
  const [savedListing, setSavedListing] = useState(false);
  const [availableFlatmates, setAvailableFlatmates] = useState<number | null>(null);
  const [nearbyCity, setNearbyCity] = useState("");
  useEffect(() => {
    getSignedInUser().then((user) => { if (user?.displayName) setName(user.displayName.split(" ")[0]); }).catch(() => undefined);
    mobileApiRequest<{ people: unknown[] }>("/flatmates").then((result) => setAvailableFlatmates(result.people.length)).catch(() => undefined);
  }, []);

  return (
    <AppFrame active="Discover">
      <View style={styles.greetingRow}>
        <View style={styles.greetingCopy}>
          <Text style={styles.greeting}>Hey, {name} <Text style={styles.wave}>👋</Text></Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Set your location in profile" onPress={() => router.push("/profile")}>
            <Text style={styles.location}>⌖  Add your location <Text style={styles.locationArrow}>↗</Text></Text>
          </Pressable>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Open profile" onPress={() => router.push("/profile")} style={styles.userAvatar}>
          <Text style={styles.userInitial}>{name.charAt(0).toUpperCase()}</Text>
        </Pressable>
      </View>

      <ImageBackground source={{ uri: apartmentPhoto }} imageStyle={styles.heroImage} style={styles.hero}>
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Eyebrow>THE RIGHT PEOPLE. A BETTER HOME.</Eyebrow>
          <Text style={styles.heroTitle}>Find Your{ "\n" }Next Flatmate</Text>
          <Text style={styles.heroSubtitle}>Better living starts with the right people.</Text>
          <ActionButton label="Discover flatmates  →" onPress={() => router.push("/discover")} />
        </View>
        <View style={styles.heroOrb} />
      </ImageBackground>

      <View>
        <SectionTitle title="Make your next move" />
        <View style={styles.featureRow}>
          <ImageBackground source={{ uri: flatmatePhoto }} imageStyle={styles.featureImage} style={styles.featureCard}>
            <View style={styles.imageShade} />
            <Text style={styles.featureEyebrow}>YOUR PEOPLE</Text>
            <Text style={styles.featureTitle}>Find a{ "\n" }flatmate</Text>
            <Text style={styles.featureMeta}>{availableFlatmates === null ? "Meet your kind of people" : `${availableFlatmates} profiles available`}</Text>
            <Pressable accessibilityRole="button" onPress={() => router.push("/discover")} style={styles.featureLink}><Text style={styles.featureLinkText}>Explore  ↗</Text></Pressable>
          </ImageBackground>
          <ImageBackground source={{ uri: bedroomPhoto }} imageStyle={styles.featureImage} style={styles.featureCard}>
            <View style={styles.imageShade} />
            <Text style={styles.featureEyebrow}>YOUR NEXT ADDRESS</Text>
            <Text style={styles.featureTitle}>Explore{ "\n" }flats</Text>
            <Text style={styles.featureMeta}><Text style={styles.yellow}>86</Text> rooms · sample</Text>
            <Pressable accessibilityRole="button" onPress={() => router.push("/explore")} style={styles.featureLink}><Text style={styles.featureLinkText}>Explore  ↗</Text></Pressable>
          </ImageBackground>
        </View>
      </View>

      <View>
        <SectionTitle title="AI Matches For You" />
        <View style={styles.aiCard}>
        <View style={styles.aiGlow} />
        <View style={styles.aiTop}><View><Eyebrow>AI MATCHING</Eyebrow><Text style={styles.aiTitle}>A good fit, by the details.</Text></View><Text style={styles.aiSpark}>✳</Text></View>
        <Text style={styles.aiCopy}>Compare budgets, locations, and daily routines before you connect.</Text>
        <View style={styles.aiBottom}><PreviewTag>DEMO INSIGHT</PreviewTag><ActionButton label="Explore matching" onPress={() => router.push("/compatibility")} secondary /></View>
        </View>
      </View>

      <View>
        <SectionTitle title="Recently added flats" action="See all  →" onAction={() => router.push("/explore")} />
        <ImageBackground source={{ uri: apartmentPhoto }} imageStyle={styles.listingImage} style={styles.listingCard}>
          <View style={styles.imageShade} />
          <View style={styles.verified}><Text style={styles.verifiedText}>✓ SAMPLE LISTING</Text></View>
          <View style={styles.listingDetails}><Text style={styles.listingPlace}>INDIRANAGAR · BENGALURU</Text><Text style={styles.listingTitle}>A light-filled place to land</Text><Text style={styles.listingPrice}>₹18,000<Text style={styles.listingMonth}> / month · preview</Text></Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel={savedListing ? "Remove saved sample flat" : "Save sample flat"} accessibilityState={{ selected: savedListing }} onPress={() => setSavedListing((value) => !value)} style={styles.saveButton}><Text style={[styles.saveIcon, savedListing && styles.savedIcon]}>{savedListing ? "♥" : "♡"}</Text></Pressable>
        </ImageBackground>
      </View>

      <View>
        <SectionTitle title="Roommate stories" action="See all  →" onAction={() => router.push("/stories")} />
        <View style={styles.storiesRow}>
          {storyPhotos.map((photo, index) => (
            <Pressable key={photo} accessibilityRole="button" accessibilityLabel={`Open sample roommate story ${index + 1}`} onPress={() => router.push("/stories")} style={styles.storyItem}>
              <ImageBackground source={{ uri: photo }} imageStyle={styles.storyPhoto} style={styles.storyRing}><View style={styles.storyPlay}><Text style={styles.storyPlayText}>▶</Text></View></ImageBackground>
              <Text style={styles.storyName}>{["Ananya", "Rohan", "Mira", "Arjun"][index]}</Text>
            </Pressable>
          ))}
          <Pressable accessibilityRole="button" onPress={() => router.push("/stories")} style={[styles.storyRing, styles.addStory]}><Text style={styles.addStoryText}>＋</Text><Text style={styles.storyName}>Add</Text></Pressable>
        </View>
        <Text style={styles.disclaimer}>Stories and property cards use sample content in this prototype.</Text>
      </View>

      <View>
        <SectionTitle title="Nearby locations" />
        <View style={styles.nearbyRow}>{["Bengaluru", "Pune", "Mumbai", "Hyderabad"].map((city) => <Pressable key={city} accessibilityRole="button" accessibilityState={{ selected: nearbyCity === city }} onPress={() => setNearbyCity(city)} style={[styles.nearbyChip, nearbyCity === city && styles.nearbySelected]}><Text style={[styles.nearbyText, nearbyCity === city && styles.nearbyTextSelected]}>{city}</Text></Pressable>)}</View>
        {nearbyCity ? <Text style={styles.disclaimer}>{nearbyCity} selected for this preview. Search filters aren’t connected yet.</Text> : null}
      </View>
    </AppFrame>
  );
}

const styles = StyleSheet.create({
  greetingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 1 },
  greetingCopy: { gap: 5 }, greeting: { color: palette.white, fontSize: 24, fontWeight: "900", letterSpacing: -0.8 }, wave: { fontSize: 20 },
  location: { color: palette.muted, fontSize: 12 }, locationArrow: { color: palette.blueLight, fontWeight: "800" },
  userAvatar: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: palette.blueLight, borderRadius: 24, backgroundColor: "#252525" }, userInitial: { color: palette.white, fontSize: 18, fontWeight: "900" },
  hero: { minHeight: 310, justifyContent: "flex-end", overflow: "hidden", borderRadius: 26, backgroundColor: palette.blue }, heroImage: { borderRadius: 26, opacity: 0.5 }, heroOverlay: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(20,32,114,0.74)" },
  heroContent: { zIndex: 1, padding: 22, gap: 10 }, heroTitle: { color: palette.white, fontSize: 33, lineHeight: 36, fontWeight: "900", letterSpacing: -1 }, heroSubtitle: { maxWidth: 245, marginBottom: 7, color: "#F3F4FF", fontSize: 13, lineHeight: 19 }, heroOrb: { position: "absolute", top: -72, right: -51, width: 210, height: 210, borderWidth: 1, borderColor: "rgba(255,255,255,0.22)", borderRadius: 105, backgroundColor: "rgba(82,109,255,0.35)" },
  featureRow: { flexDirection: "row", gap: 12 }, featureCard: { flex: 1, minHeight: 205, justifyContent: "flex-end", overflow: "hidden", padding: 14, borderRadius: 21, backgroundColor: "#222" }, featureImage: { borderRadius: 21, opacity: 0.62 }, imageShade: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.45)" }, featureEyebrow: { color: "#E4E7FF", fontSize: 8, fontWeight: "900", letterSpacing: 1.1 }, featureTitle: { marginTop: 7, color: palette.white, fontSize: 20, lineHeight: 22, fontWeight: "900" }, featureMeta: { marginTop: 5, color: "#E4E4E7", fontSize: 10 }, yellow: { color: palette.yellow, fontWeight: "900" }, featureLink: { alignSelf: "flex-start", marginTop: 10, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 11, backgroundColor: palette.blue }, featureLinkText: { color: palette.white, fontSize: 10, fontWeight: "800" },
  aiCard: { overflow: "hidden", padding: 18, borderWidth: 1, borderColor: "rgba(82,109,255,0.42)", borderRadius: 22, backgroundColor: "#171A2B" }, aiGlow: { position: "absolute", top: -85, right: -65, width: 190, height: 190, borderRadius: 95, backgroundColor: "rgba(48,79,254,0.25)" }, aiTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, aiTitle: { marginTop: 7, color: palette.white, fontSize: 18, fontWeight: "800" }, aiSpark: { color: palette.blueLight, fontSize: 34 }, aiCopy: { maxWidth: 285, marginTop: 8, color: palette.muted, fontSize: 12, lineHeight: 18 }, aiBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 15 },
  listingCard: { height: 250, justifyContent: "space-between", overflow: "hidden", padding: 15, borderRadius: 22, backgroundColor: "#232323" }, listingImage: { borderRadius: 22, opacity: 0.68 }, verified: { alignSelf: "flex-start", paddingHorizontal: 9, paddingVertical: 6, borderRadius: 99, backgroundColor: palette.yellow }, verifiedText: { color: "#080808", fontSize: 8, fontWeight: "900", letterSpacing: 0.5 }, listingDetails: { zIndex: 1 }, listingPlace: { color: "#E4E7FF", fontSize: 9, fontWeight: "800", letterSpacing: 1.2 }, listingTitle: { marginTop: 5, color: palette.white, fontSize: 21, fontWeight: "900" }, listingPrice: { marginTop: 5, color: palette.white, fontSize: 17, fontWeight: "900" }, listingMonth: { color: "#E4E4E7", fontSize: 10, fontWeight: "500" }, saveButton: { position: "absolute", zIndex: 2, top: 12, right: 12, width: 38, height: 38, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", borderRadius: 19, backgroundColor: "rgba(0,0,0,0.5)" }, saveIcon: { color: palette.white, fontSize: 21 }, savedIcon: { color: palette.yellow },
  storiesRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 }, storyItem: { alignItems: "center", gap: 6 }, storyRing: { width: 58, height: 58, alignItems: "center", justifyContent: "center", overflow: "hidden", borderWidth: 2, borderColor: palette.blueLight, borderRadius: 29 }, storyPhoto: { borderRadius: 29 }, storyPlay: { width: 22, height: 22, alignItems: "center", justifyContent: "center", borderRadius: 11, backgroundColor: "rgba(0,0,0,0.52)" }, storyPlayText: { color: palette.white, fontSize: 9 }, storyName: { color: palette.muted, fontSize: 9 }, addStory: { borderColor: "rgba(232,255,0,0.6)", backgroundColor: "rgba(232,255,0,0.07)" }, addStoryText: { color: palette.yellow, fontSize: 28, lineHeight: 32 }, disclaimer: { marginTop: 10, color: "#85858D", fontSize: 9, lineHeight: 14 }, nearbyRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, nearbyChip: { paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", borderRadius: 99, backgroundColor: palette.card }, nearbySelected: { borderColor: palette.blueLight, backgroundColor: "rgba(48,79,254,0.2)" }, nearbyText: { color: palette.muted, fontSize: 10, fontWeight: "700" }, nearbyTextSelected: { color: palette.white },
});
