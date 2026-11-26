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
        <ActivityIndicator color="#7657e8" size="large" />
        <Text style={styles.muted}>Finding flatmates…</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>avenli<Text style={styles.brandDot}>.</Text></Text>
          <Text style={styles.eyebrow}>MEET YOUR FUTURE FLATMATES</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Sign out" disabled={signingOut} onPress={handleSignOut} style={styles.signOutButton}>
          {signingOut ? <ActivityIndicator color="#7657e8" /> : <Text style={styles.signOutText}>Sign out</Text>}
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
              {working ? <ActivityIndicator color="#7657e8" /> : <Text style={styles.passText}>Pass</Text>}
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={`Like ${person.displayName}`} accessibilityHint="Likes this profile and moves to the next one" disabled={working} onPress={likeCurrent} style={({ pressed }) => [styles.likeButton, pressed && !working ? styles.pressed : null, working ? styles.disabled : null]}>
              {working ? <ActivityIndicator color="#fff" /> : <Text style={styles.likeText}>Like  ♥</Text>}
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
  page: { flex: 1, paddingHorizontal: 24, paddingTop: 58, paddingBottom: 24, backgroundColor: "#fff" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, backgroundColor: "#fff" },
  muted: { color: "#77758a", fontSize: 15 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { color: "#222033", fontSize: 27, fontWeight: "900" },
  brandDot: { color: "#7657e8" },
  eyebrow: { marginTop: 4, color: "#7657e8", fontSize: 10, fontWeight: "800", letterSpacing: 1.1 },
  signOutButton: { minHeight: 44, justifyContent: "center", paddingHorizontal: 13, borderRadius: 12, borderWidth: 1, borderColor: "#e4e1eb" },
  signOutText: { color: "#7657e8", fontSize: 13, fontWeight: "700" },
  deckCaption: { marginTop: 26, marginBottom: 14, color: "#77758a", fontSize: 14 },
  profileCard: { flex: 1, minHeight: 330, maxHeight: 520, alignItems: "center", justifyContent: "center", paddingHorizontal: 25, paddingVertical: 25, borderRadius: 25, borderWidth: 1, borderColor: "#eceaf2", backgroundColor: "#fbfaff", elevation: 3, shadowColor: "#222033", shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
  avatar: { width: 76, height: 76, alignItems: "center", justifyContent: "center", borderRadius: 38, backgroundColor: "#eee9ff" },
  avatarText: { color: "#7657e8", fontSize: 31, fontWeight: "800" },
  name: { marginTop: 19, color: "#222033", fontSize: 27, fontWeight: "900", textAlign: "center" },
  location: { marginTop: 6, color: "#77758a", fontSize: 15 },
  budgetPill: { marginTop: 13, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18, backgroundColor: "#eee9ff" },
  budget: { color: "#6246c6", fontSize: 13, fontWeight: "700" },
  divider: { width: 42, height: 1, marginTop: 19, marginBottom: 16, backgroundColor: "#e2deed" },
  bio: { color: "#514e61", fontSize: 15, lineHeight: 23, textAlign: "center" },
  swipeHint: { marginTop: 19, color: "#9290a0", fontSize: 11 },
  actions: { flexDirection: "row", gap: 14, marginTop: 19 },
  passButton: { flex: 1, minHeight: 58, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#7657e8", borderRadius: 16, backgroundColor: "#fff" },
  likeButton: { flex: 1, minHeight: 58, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "#7657e8" },
  passText: { color: "#7657e8", fontSize: 16, fontWeight: "800" },
  likeText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.65 },
  remaining: { marginTop: 13, color: "#9290a0", fontSize: 12, textAlign: "center" },
  errorBox: { marginTop: 20, padding: 15, borderRadius: 14, backgroundColor: "#fff3f2" },
  errorText: { color: "#a53c45", fontSize: 13, lineHeight: 19 },
  retryButton: { alignSelf: "center", marginTop: 14, paddingHorizontal: 19, paddingVertical: 12, borderRadius: 12, backgroundColor: "#eee9ff" },
  retryText: { color: "#6246c6", fontSize: 14, fontWeight: "800" },
  matchNotice: { marginTop: 16, padding: 13, borderRadius: 13, backgroundColor: "#eef7ed", color: "#3f6840", fontSize: 14, fontWeight: "700", lineHeight: 20 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  emptyIcon: { color: "#7657e8", fontSize: 54 },
  emptyTitle: { marginTop: 13, color: "#222033", fontSize: 22, fontWeight: "900", textAlign: "center" },
  emptyCopy: { marginTop: 9, color: "#77758a", fontSize: 14, lineHeight: 21, textAlign: "center" },
});
