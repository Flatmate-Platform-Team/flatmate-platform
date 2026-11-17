import { Text, View } from "react-native";

export default function Discover() {
  return (
    <View style={styles.page}>
      <Text style={styles.title}>Discover</Text>
      <Text style={styles.description}>
        Property and flatmate discovery, filters, likes and matches will be
        built here.
      </Text>
    </View>
  );
}

const styles = {
  page: {
    flex: 1,
    padding: 28,
    paddingTop: 75,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
  },
  description: {
    fontSize: 16,
    color: "#77758a",
    lineHeight: 24,
    marginTop: 12,
  },
} as const;
