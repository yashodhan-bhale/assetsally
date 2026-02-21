import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "../contexts/auth-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "#1e293b" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
            contentStyle: { backgroundColor: "#0f172a" },
            headerLeft: ({ canGoBack, label }) => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {!canGoBack && (
                  <View style={{ marginLeft: 16 }}>
                    <Image
                      source={require("../assets/client-logo.png")}
                      style={{ width: 28, height: 28 }}
                      resizeMode="contain"
                    />
                  </View>
                )}
              </View>
            ),
          }}
        >
          <Stack.Screen
            name="index"
            options={{ title: "Ratan Rathi & Co.", headerShown: true }}
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
    </SafeAreaProvider>
  );
}
