import { useMemo, useState } from "react";
import { ImageBackground, Pressable, Share, StyleSheet, Text, TextInput, View } from "react-native";
import { AppFrame, Eyebrow, PreviewTag, SectionTitle, palette, ui } from "../components/app-ui";

const properties = [
  { id: "indiranagar", title: "Light-filled shared home", area: "Indiranagar", city: "Bengaluru", rent: 18000, deposit: 36000, rooms: 2, tags: ["Furnished", "Balcony", "Near metro"], photo: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1100&q=85" },
  { id: "koramangala", title: "A calm corner of the city", area: "Koramangala", city: "Bengaluru", rent: 14500, deposit: 29000, rooms: 1, tags: ["Workspace", "Kitchen", "Pet friendly"], photo: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1100&q=85" },
  { id: "baner", title: "Sunlit rooms, easy commute", area: "Baner", city: "Pune", rent: 16000, deposit: 32000, rooms: 3, tags: ["Furnished", "Gym", "Transit nearby"], photo: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1100&q=85" },
];

export default function Explore() {
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  const [mapView, setMapView] = useState(false);
  const shown = useMemo(() => properties.filter((item) => `${item.area} ${item.city}`.toLowerCase().includes(query.trim().toLowerCase())), [query]);

  function toggleSave(id: string) { setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }

  return (
    <AppFrame active="Explore">
      <View style={styles.heading}><Eyebrow>EXPLORE FLATS</Eyebrow><Text style={ui.heading}>Find a place{ "\n" }that feels like home.</Text><Text style={ui.subheading}>Thoughtful spaces, clear details, and room to settle in.</Text></View>
      <PreviewTag>ILLUSTRATIVE SAMPLE LISTINGS</PreviewTag>
      <View style={styles.search}><Text style={styles.searchIcon}>⌕</Text><TextInput accessibilityLabel="Search by city or area" placeholder="City or neighbourhood" placeholderTextColor="#85858D" value={query} onChangeText={setQuery} style={styles.searchInput} /></View>
      <View style={styles.viewToggle}>
        <Pressable accessibilityRole="button" accessibilityState={{ selected: !mapView }} onPress={() => setMapView(false)} style={[styles.toggleButton, !mapView && styles.toggleActive]}><Text style={[styles.toggleText, !mapView && styles.toggleSelected]}>☷  List</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityState={{ selected: mapView }} onPress={() => setMapView(true)} style={[styles.toggleButton, mapView && styles.toggleActive]}><Text style={[styles.toggleText, mapView && styles.toggleSelected]}>⌖  Map</Text></Pressable>
      </View>
      {mapView ? (
        <View style={styles.mapPreview}><View style={styles.mapGrid} /><Text style={styles.mapPin}>₹18k</Text><Text style={styles.mapPinTwo}>₹14.5k</Text><Text style={styles.mapTitle}>Map preview</Text><Text style={styles.mapHint}>Live maps will appear when a map provider is connected.</Text></View>
      ) : null}
      <SectionTitle title={`${shown.length} homes to explore`} />
      {!shown.length ? <View style={styles.empty}><Text style={styles.emptyTitle}>No sample homes in that area</Text><Text style={ui.muted}>Try another city or neighbourhood.</Text></View> : null}
      {shown.map((home) => (
        <View key={home.id} style={styles.propertyCard}>
          <ImageBackground source={{ uri: home.photo }} imageStyle={styles.photo} style={styles.photoArea}>
            <View style={styles.photoShade} />
            <View style={styles.badge}><Text style={styles.badgeText}>✓  SAMPLE</Text></View>
            <View style={styles.photoActions}>
              <Pressable accessibilityRole="button" accessibilityLabel={saved.includes(home.id) ? "Remove saved listing" : "Save listing"} onPress={() => toggleSave(home.id)} style={styles.roundButton}><Text style={[styles.roundIcon, saved.includes(home.id) && styles.savedIcon]}>{saved.includes(home.id) ? "♥" : "♡"}</Text></Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Share sample listing" onPress={() => void Share.share({ message: `${home.title}, ${home.area}, ${home.city} · ₹${home.rent.toLocaleString("en-IN")} per month (sample listing)` })} style={styles.roundButton}><Text style={styles.roundIcon}>↗</Text></Pressable>
            </View>
            <Text style={styles.photoTitle}>{home.title}</Text>
          </ImageBackground>
          <View style={styles.propertyBody}>
            <Text style={styles.location}>{home.area.toUpperCase()} · {home.city.toUpperCase()}</Text>
            <View style={styles.rentRow}><Text style={styles.rent}>₹{home.rent.toLocaleString("en-IN")}<Text style={styles.perMonth}> / month</Text></Text><Text style={styles.rooms}>{home.rooms} rooms</Text></View>
            <Text style={styles.deposit}>Deposit ₹{home.deposit.toLocaleString("en-IN")}</Text>
            <View style={styles.tags}>{home.tags.map((tag) => <Text key={tag} style={styles.tag}>{tag}</Text>)}</View>
          </View>
        </View>
      ))}
      <Text style={styles.disclaimer}>Photos and listing details are sample content. Saves are stored only for this session.</Text>
    </AppFrame>
  );
}

const styles = StyleSheet.create({
  heading: { gap: 5, marginBottom: 4 }, search: { height: 54, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 15, borderWidth: 1, borderColor: palette.line, borderRadius: 16, backgroundColor: palette.card }, searchIcon: { color: palette.blueLight, fontSize: 24 }, searchInput: { flex: 1, color: palette.white, fontSize: 14 },
  viewToggle: { flexDirection: "row", gap: 6, padding: 5, borderWidth: 1, borderColor: palette.line, borderRadius: 15, backgroundColor: palette.card }, toggleButton: { flex: 1, minHeight: 38, alignItems: "center", justifyContent: "center", borderRadius: 11 }, toggleActive: { backgroundColor: palette.blue }, toggleText: { color: palette.muted, fontSize: 12, fontWeight: "700" }, toggleSelected: { color: palette.white },
  mapPreview: { height: 220, alignItems: "center", justifyContent: "center", overflow: "hidden", borderWidth: 1, borderColor: palette.line, borderRadius: 22, backgroundColor: "#171923" }, mapGrid: { ...StyleSheet.absoluteFill, opacity: 0.45, backgroundColor: "#1D2237", borderColor: "#4C5580", borderWidth: 1, transform: [{ rotate: "-18deg" }, { scale: 1.5 }] }, mapPin: { position: "absolute", top: 55, left: 55, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 12, backgroundColor: palette.yellow, color: "#080808", fontSize: 11, fontWeight: "900" }, mapPinTwo: { position: "absolute", top: 92, right: 50, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 12, backgroundColor: palette.yellow, color: "#080808", fontSize: 11, fontWeight: "900" }, mapTitle: { color: palette.white, fontSize: 19, fontWeight: "900" }, mapHint: { maxWidth: 250, marginTop: 6, color: palette.muted, fontSize: 11, textAlign: "center" },
  propertyCard: { overflow: "hidden", borderWidth: 1, borderColor: palette.line, borderRadius: 23, backgroundColor: palette.card }, photoArea: { height: 205, justifyContent: "space-between", padding: 13, backgroundColor: "#242424" }, photo: { borderTopLeftRadius: 22, borderTopRightRadius: 22 }, photoShade: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.35)" }, badge: { alignSelf: "flex-start", paddingHorizontal: 9, paddingVertical: 6, borderRadius: 99, backgroundColor: palette.yellow }, badgeText: { color: "#080808", fontSize: 8, fontWeight: "900" }, photoActions: { position: "absolute", top: 12, right: 12, flexDirection: "row", gap: 8 }, roundButton: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.25)", borderRadius: 20, backgroundColor: "rgba(8,8,8,0.65)" }, roundIcon: { color: palette.white, fontSize: 19, fontWeight: "800" }, savedIcon: { color: palette.yellow }, photoTitle: { zIndex: 1, color: palette.white, fontSize: 21, fontWeight: "900" }, propertyBody: { padding: 15 }, location: { color: palette.blueLight, fontSize: 9, fontWeight: "900", letterSpacing: 1.1 }, rentRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 7 }, rent: { color: palette.white, fontSize: 19, fontWeight: "900" }, perMonth: { color: palette.muted, fontSize: 10, fontWeight: "500" }, rooms: { color: palette.yellow, fontSize: 11, fontWeight: "800" }, deposit: { marginTop: 4, color: palette.muted, fontSize: 11 }, tags: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 13 }, tag: { paddingHorizontal: 9, paddingVertical: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderRadius: 99, color: "#E4E4E7", fontSize: 9 }, empty: { alignItems: "center", gap: 7, padding: 24, borderRadius: 20, backgroundColor: palette.card }, emptyTitle: { color: palette.white, fontSize: 15, fontWeight: "800" }, disclaimer: { color: "#85858D", fontSize: 9, lineHeight: 14, textAlign: "center" },
});
