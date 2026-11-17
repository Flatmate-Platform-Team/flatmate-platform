import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Home() {
  return (
    <View style={styles.page}>
      <Text style={styles.brand}>avenli.</Text>
      <Text style={styles.tag}>YOUR NEXT CHAPTER STARTS HERE</Text>
      <Text style={styles.title}>
        Good spaces.{"\n"}Great people.
      </Text>
      <Text style={styles.copy}>
        Discover rooms and compatible flatmates in one place.
      </Text>

      <View style={styles.card}>
        <Text style={styles.heading}>Find a place that fits</Text>
        <Text style={styles.copy}>
          Explore shared homes and neighbourhoods.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Meet your kind of people</Text>
        <Text style={styles.copy}>
          Connect with people whose lifestyle matches yours.
        </Text>
      </View>

      <Link href="/discover" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Explore demo</Text>
        </Pressable>
      </Link>
      <Text style={styles.note}>Starter UI only · No backend connected.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 28,
    paddingTop: 70,
    backgroundColor: "#fff",
  },
  brand: {
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 55,
    color: "#222033",
  },
  tag: {
    fontSize: 11,
    letterSpacing: 1.5,
    color: "#7657e8",
    fontWeight: "800",
  },
  title: {
    fontSize: 46,
    lineHeight: 52,
    fontWeight: "900",
    marginTop: 16,
    color: "#222033",
  },
  copy: {
    fontSize: 15,
    lineHeight: 23,
    color: "#77758a",
    marginTop: 12,
  },
  card: {
    padding: 20,
    borderWidth: 1,
    borderColor: "#eceaf2",
    borderRadius: 20,
    marginTop: 22,
  },
  heading: {
    fontSize: 18,
    fontWeight: "800",
    color: "#222033",
  },
  button: {
    backgroundColor: "#7657e8",
    padding: 17,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 26,
  },
  buttonText: {
    color: "white",
    fontWeight: "800",
  },
  note: {
    fontSize: 11,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
  },
});
