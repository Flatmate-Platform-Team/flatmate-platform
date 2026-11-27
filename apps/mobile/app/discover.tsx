import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { getSignedInUser, MobileApiError, mobileApiRequest, signOut } from "../lib/auth";

type Flatmate = {
  id: string;
  displayName: string;
  liked: boolean;
  profile: {
    bio: string | null;
    city: string | null;
    budgetMin: number | null;
    budgetMax: number | null;
    preferences: unknown;
  } | null;
};

type FlatmatesResponse = { people: Flatmate[] };
type LikeResponse = { matched: boolean };
type PassResponse = { passed: boolean };

function budgetLabel(person: Flatmate) {
  const minimum = person.profile?.budgetMin;
  const maximum = person.profile?.budgetMax;
  if (minimum == null && maximum == null) return "Budget not added";
  const format = (value: number) => "₹" + value.toLocaleString("en-IN");
  if (minimum != null && maximum != null) return `${format(minimum)}–${format(maximum)} / month`;
  return `${format(minimum ?? maximum!)} / month`;
}

export default function Discover() {
  const router = useRouter();
  const [people, setPeople] = useState<Flatmate[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const [matchNotice, setMatchNotice] = useState("");
  const translateX = useRef(new Animated.Value(0)).current;
  const person = people[0] ?? null;

  const loadPeople = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await mobileApiRequest<FlatmatesResponse>("/flatmates");
      setPeople(result.people.filter((candidate) => !candidate.liked));
    } catch (reason) {
      if (reason instanceof MobileApiError && reason.status === 401) {
        router.replace("/");
        return;
      }
      setError(reason instanceof Error ? reason.message : "Could not load flatmates.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    let active = true;
    getSignedInUser()
      .then((user) => {
        if (active && !user) router.replace("/");
        else if (active) void loadPeople();
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "Could not verify your sign-in.");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [loadPeople, router]);

  const finishCard = useCallback(() => {
    setPeople((current) => current.slice(1));
    translateX.setValue(0);
  }, [translateX]);

  const likeCurrent = useCallback(async () => {
    if (!person || working) return;
    setWorking(true);
    setError("");
    setMatchNotice("");
    try {
      const result = await mobileApiRequest<LikeResponse>(`/flatmates/${encodeURIComponent(person.id)}/like`, { method: "POST" });
      if (result.matched) setMatchNotice(`It’s a mutual like with ${person.displayName}! You can find your match on the website.`);
      finishCard();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not like this profile. Please try again.");
    } finally {
      setWorking(false);
    }
  }, [finishCard, person, working]);

  const passCurrent = useCallback(async () => {
    if (!person || working) return;
    setWorking(true);
    setError("");
    setMatchNotice("");
    try {
      await mobileApiRequest<PassResponse>(`/flatmates/${encodeURIComponent(person.id)}/pass`, { method: "POST" });
      finishCard();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not pass this profile. Please try again.");
    } finally {
      setWorking(false);
    }
  }, [finishCard, person, working]);

  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_event, gesture) => Math.abs(gesture.dx) > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
    onPanResponderMove: (_event, gesture) => translateX.setValue(gesture.dx),
    onPanResponderRelease: (_event, gesture) => {
      if (gesture.dx > 100) void likeCurrent();
      else if (gesture.dx < -100) void passCurrent();
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true, friction: 6 }).start();
    },
    onPanResponderTerminate: () => Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start(),
  }), [likeCurrent, passCurrent, translateX]);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    router.replace("/");
    setSigningOut(false);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#c6e3ce" size="large" />
        <Text style={styles.muted}>Finding flatmates…</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View pointerEvents="none" style={styles.glowTop} />
      <View pointerEvents="none" style={styles.glowBottom} />
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>avenli<Text style={styles.brandDot}>.</Text></Text>
          <Text style={styles.eyebrow}>MEET YOUR FUTURE FLATMATES</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Sign out" disabled={signingOut} onPress={handleSignOut} style={styles.signOutButton}>
          {signingOut ? <ActivityIndicator color="#c6e3ce" /> : <Text style={styles.signOutText}>Sign out</Text>}
        </Pressable>
      </View>

      {matchNotice ? <Text accessibilityRole="alert" style={styles.matchNotice}>{matchNotice}</Text> : null}
      {error ? (
        <View style={styles.errorBox}>
          <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text>
          <Pressable accessibilityRole="button" onPress={loadPeople} style={styles.retryButton}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : null}

      {person ? (
        <>
          <Text style={styles.deckCaption}>A good home starts with good people.</Text>
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.profileCard,
              {
                transform: [
                  { translateX },
                  { rotate: translateX.interpolate({ inputRange: [-220, 0, 220], outputRange: ["-9deg", "0deg", "9deg"], extrapolate: "clamp" }) },
                ],
              },
            ]}
          >
            <View style={styles.avatar}><Text style={styles.avatarText}>{person.displayName.trim().charAt(0).toUpperCase()}</Text></View>
            <Text style={styles.name}>{person.displayName}</Text>
            <Text style={styles.location}>{person.profile?.city || "City not added"}</Text>
            <View style={styles.budgetPill}><Text style={styles.budget}>{budgetLabel(person)}</Text></View>
            <View style={styles.divider} />
            <Text style={styles.bio}>{person.profile?.bio || "This flatmate hasn’t added a bio yet."}</Text>
            <Text style={styles.swipeHint}>Swipe left to pass · right to like</Text>
          </Animated.View>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" accessibilityLabel={`Pass on ${person.displayName}`} accessibilityHint="Removes this profile from your discovery deck" disabled={working} onPress={passCurrent} style={({ pressed }) => [styles.passButton, pressed && !working ? styles.pressed : null, working ? styles.disabled : null]}>
              {working ? <ActivityIndicator color="#c6e3ce" /> : <Text style={styles.passText}>Pass</Text>}
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={`Like ${person.displayName}`} accessibilityHint="Likes this profile and moves to the next one" disabled={working} onPress={likeCurrent} style={({ pressed }) => [styles.likeButton, pressed && !working ? styles.pressed : null, working ? styles.disabled : null]}>
              {working ? <ActivityIndicator color="#14251c" /> : <Text style={styles.likeText}>Like  ♥</Text>}
            </Pressable>
          </View>
          <Text style={styles.remaining}>{people.length} {people.length === 1 ? "profile" : "profiles"} remaining</Text>
        </>
      ) : !error ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>♡</Text>
          <Text style={styles.emptyTitle}>You’re all caught up.</Text>
          <Text style={styles.emptyCopy}>There are no more flatmate profiles to show right now.</Text>
          <Pressable accessibilityRole="button" onPress={loadPeople} style={styles.retryButton}>
            <Text style={styles.retryText}>Refresh profiles</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, paddingHorizontal: 24, paddingTop: 58, paddingBottom: 24, backgroundColor: "#080d0b" },
  glowTop: { position: "absolute", top: -150, right: -120, width: 340, height: 340, borderRadius: 170, backgroundColor: "rgba(75,145,103,0.12)" },
  glowBottom: { position: "absolute", bottom: 70, left: -190, width: 320, height: 320, borderRadius: 160, backgroundColor: "rgba(177,129,88,0.07)" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, backgroundColor: "#080d0b" },
  muted: { color: "#aab5ad", fontSize: 15 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { color: "#f3f2eb", fontSize: 27, fontWeight: "900", letterSpacing: -1 },
  brandDot: { color: "#a9d9bd" },
  eyebrow: { marginTop: 4, color: "#c1d9c8", fontSize: 10, fontWeight: "800", letterSpacing: 1.1 },
  signOutButton: { minHeight: 44, justifyContent: "center", paddingHorizontal: 13, borderRadius: 14, borderWidth: 1, borderColor: "rgba(236,246,239,0.18)", backgroundColor: "rgba(255,255,255,0.055)" },
  signOutText: { color: "#c6e3ce", fontSize: 13, fontWeight: "700" },
  deckCaption: { marginTop: 26, marginBottom: 14, color: "#aab5ad", fontSize: 14 },
  profileCard: { flex: 1, minHeight: 330, maxHeight: 520, alignItems: "center", justifyContent: "center", paddingHorizontal: 25, paddingVertical: 25, borderRadius: 26, borderWidth: 1, borderColor: "rgba(226,245,232,0.2)", backgroundColor: "rgba(233,245,237,0.075)", elevation: 8, shadowColor: "#6fae86", shadowOpacity: 0.16, shadowRadius: 24, shadowOffset: { width: 0, height: 12 } },
  avatar: { width: 76, height: 76, alignItems: "center", justifyContent: "center", borderRadius: 38, borderWidth: 1, borderColor: "rgba(198,227,206,0.3)", backgroundColor: "rgba(198,227,206,0.14)" },
  avatarText: { color: "#c6e3ce", fontSize: 31, fontWeight: "800" },
  name: { marginTop: 19, color: "#f3f2eb", fontSize: 27, fontWeight: "900", textAlign: "center" },
  location: { marginTop: 6, color: "#b5c1b8", fontSize: 15 },
  budgetPill: { marginTop: 13, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18, borderWidth: 1, borderColor: "rgba(198,227,206,0.18)", backgroundColor: "rgba(198,227,206,0.1)" },
  budget: { color: "#c6e3ce", fontSize: 13, fontWeight: "700" },
  divider: { width: 42, height: 1, marginTop: 19, marginBottom: 16, backgroundColor: "rgba(234,244,236,0.2)" },
  bio: { color: "#d1d8d2", fontSize: 15, lineHeight: 23, textAlign: "center" },
  swipeHint: { marginTop: 19, color: "#91a198", fontSize: 11 },
  actions: { flexDirection: "row", gap: 14, marginTop: 19 },
  passButton: { flex: 1, minHeight: 58, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(236,246,239,0.2)", borderRadius: 17, backgroundColor: "rgba(255,255,255,0.055)" },
  likeButton: { flex: 1, minHeight: 58, alignItems: "center", justifyContent: "center", borderRadius: 17, backgroundColor: "#c6e3ce", shadowColor: "#76bd93", shadowOpacity: 0.2, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
  passText: { color: "#e0e8e1", fontSize: 16, fontWeight: "800" },
  likeText: { color: "#14251c", fontSize: 16, fontWeight: "800" },
  pressed: { opacity: 0.84, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.65 },
  remaining: { marginTop: 13, color: "#91a198", fontSize: 12, textAlign: "center" },
  errorBox: { marginTop: 20, padding: 15, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,180,168,0.2)", backgroundColor: "rgba(255,180,168,0.08)" },
  errorText: { color: "#ffb4a8", fontSize: 13, lineHeight: 19 },
  retryButton: { alignSelf: "center", marginTop: 14, paddingHorizontal: 19, paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: "rgba(198,227,206,0.2)", backgroundColor: "rgba(198,227,206,0.1)" },
  retryText: { color: "#c6e3ce", fontSize: 14, fontWeight: "800" },
  matchNotice: { marginTop: 16, padding: 13, borderRadius: 15, borderWidth: 1, borderColor: "rgba(185,229,198,0.2)", backgroundColor: "rgba(185,229,198,0.09)", color: "#b9e5c6", fontSize: 14, fontWeight: "700", lineHeight: 20 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  emptyIcon: { color: "#c6e3ce", fontSize: 54 },
  emptyTitle: { marginTop: 13, color: "#f3f2eb", fontSize: 22, fontWeight: "900", textAlign: "center" },
  emptyCopy: { marginTop: 9, color: "#aab5ad", fontSize: 14, lineHeight: 21, textAlign: "center" },
});
