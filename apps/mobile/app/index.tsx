import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/client-logo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.title}>
          Ratan Rathi <Text style={styles.titleHighlight}>& Co.</Text>
        </Text>
        <Text style={styles.subtitle}>Auditor App</Text>
      </View>

      {/* Status Card */}
      <View style={styles.card}>
        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Ready for Audit</Text>
        </View>
        <Text style={styles.cardDescription}>
          Sign in to access your assigned locations and begin asset
          verification.
        </Text>
      </View>

      {/* Login Button */}
      <Link href="/(auth)/login" asChild>
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginButtonText}>Sign In</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </Link>

      {/* Version */}
      <Text style={styles.version}>v0.0.1 — Phase 1 Complete</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  titleHighlight: {
    color: "#60a5fa",
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 320,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#334155",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
    marginRight: 8,
  },
  statusText: {
    color: "#4ade80",
    fontSize: 14,
    fontWeight: "600",
  },
  cardDescription: {
    color: "#cbd5e1",
    fontSize: 14,
    lineHeight: 20,
  },
  loginButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  version: {
    position: "absolute",
    bottom: 24,
    color: "#475569",
    fontSize: 12,
  },
});
