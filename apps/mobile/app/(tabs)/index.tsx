import { Ionicons } from "@expo/vector-icons";
import { Q } from "@nozbe/watermelondb";
import { router } from "expo-router";
import { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../contexts/auth-context";
import { useConnectivity } from "../../contexts/connectivity-context";
import { auditFindingsCollection, auditReportsCollection } from "../../db";
import { useSync } from "../../hooks/useSync";

export default function DashboardTab() {
  const { user } = useAuth();
  const { isOnline, isSyncing, lastSyncedAt, pendingSyncCount } =
    useConnectivity();
  const { syncNow } = useSync();

  const formatLastSynced = useCallback((date: Date | null): string => {
    if (!date) return "Never synced";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return date.toLocaleDateString();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Welcome */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || "Auditor"}</Text>
        </View>

        {/* Sync Status Card */}
        <View style={styles.syncCard}>
          <View style={styles.syncHeader}>
            <View style={styles.syncStatusRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isOnline ? "#22c55e" : "#ef4444" },
                ]}
              />
              <Text
                style={[
                  styles.syncStatusText,
                  { color: isOnline ? "#4ade80" : "#fca5a5" },
                ]}
              >
                {isOnline ? "Online" : "Offline"}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.syncButton, isSyncing && { opacity: 0.6 }]}
              onPress={syncNow}
              disabled={isSyncing || !isOnline}
            >
              <Ionicons
                name={isSyncing ? "sync" : "sync-outline"}
                size={16}
                color="#60a5fa"
              />
              <Text style={styles.syncButtonText}>
                {isSyncing ? "Syncing..." : "Sync Now"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.syncDetails}>
            <View style={styles.syncDetailRow}>
              <Text style={styles.syncDetailLabel}>Last synced</Text>
              <Text style={styles.syncDetailValue}>
                {formatLastSynced(lastSyncedAt)}
              </Text>
            </View>
            {pendingSyncCount > 0 && (
              <View style={styles.syncDetailRow}>
                <Text style={styles.syncDetailLabel}>Pending uploads</Text>
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>
                    {pendingSyncCount}
                  </Text>
                </View>
              </View>
            )}
          </View>
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
              {isOnline
                ? "Your data is synced. You can go offline and continue auditing."
                : "You're offline. All changes are saved locally and will sync when you reconnect."}
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
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  welcomeText: { color: "#94a3b8", fontSize: 14 },
  userName: { color: "#fff", fontSize: 24, fontWeight: "bold", marginTop: 4 },
  syncCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#334155",
  },
  syncHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  syncStatusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  syncStatusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  syncButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#3b82f620",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  syncButtonText: { color: "#60a5fa", fontSize: 12, fontWeight: "600" },
  syncDetails: { gap: 6 },
  syncDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  syncDetailLabel: { color: "#64748b", fontSize: 13 },
  syncDetailValue: { color: "#cbd5e1", fontSize: 13 },
  pendingBadge: {
    backgroundColor: "#f59e0b20",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pendingBadgeText: { color: "#f59e0b", fontSize: 12, fontWeight: "600" },
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
