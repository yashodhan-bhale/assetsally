import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../contexts/auth-context";

export default function DashboardTab() {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Welcome */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || "Auditor"}</Text>
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: "#1e293b" }]}
            onPress={() => router.push("/(tabs)/audits")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#3b82f6" }]}>
              <Ionicons name="clipboard-outline" size={28} color="#fff" />
            </View>
            <Text style={styles.actionTitle}>Audit Tasks</Text>
            <Text style={styles.actionDesc}>View and perform audits</Text>
          </TouchableOpacity>
        </View>
        {/* Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#60a5fa"
            />
            <Text style={styles.infoText}>
              Select a location from "My Audits" to start verifying inventory
              items. Scanning is available for each item within its location.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  welcomeCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#334155",
  },
  welcomeText: { color: "#94a3b8", fontSize: 14 },
  userName: { color: "#fff", fontSize: 24, fontWeight: "bold", marginTop: 4 },
  sectionTitle: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  actionsGrid: { flexDirection: "row", gap: 12, marginBottom: 24 },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  actionTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  actionDesc: { color: "#94a3b8", fontSize: 12, marginTop: 2 },
  infoCard: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  infoText: { color: "#cbd5e1", fontSize: 13, lineHeight: 20, flex: 1 },
});
