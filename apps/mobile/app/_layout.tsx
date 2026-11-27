import { Stack } from "expo-router";
import { StatusBar } from "react-native";

export default function Layout() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#080d0b" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#080d0b" } }} />
    </>
  );
}
