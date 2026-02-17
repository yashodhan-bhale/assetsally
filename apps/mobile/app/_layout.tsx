import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AuthProvider } from "../contexts/auth-context";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#1e293b" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          contentStyle: { backgroundColor: "#0f172a" },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: "AssetsAlly", headerShown: true }}
        />
        <Stack.Screen
          name="(auth)/login"
          options={{ title: "Login", presentation: "modal" }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="audit/[id]" options={{ title: "Audit Report" }} />
        <Stack.Screen
          name="scan"
          options={{ title: "Scan QR Code", presentation: "fullScreenModal" }}
        />
      </Stack>
    </AuthProvider>
  );
}
