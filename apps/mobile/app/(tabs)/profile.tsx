import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../contexts/auth-context";
import { useConnectivity } from "../../contexts/connectivity-context";
import { useSync } from "../../hooks/useSync";

export default function ProfileTab() {
  const { user, logout } = useAuth();
  const { isOnline, isSyncing, lastSyncedAt, pendingSyncCount } =
    useConnectivity();
  const { syncNow } = useSync();

  const formatLastSynced = (date: Date | null): string => {
    if (!date) return "Never";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      {/* User Card */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color="#3b82f6" />
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role}</Text>
        </View>
      </View>

      {/* Sync Info */}
      <View style={styles.menuSection}>
        <View style={styles.menuItem}>
          <Ionicons name="sync-outline" size={20} color="#94a3b8" />
          <Text style={styles.menuText}>Last Synced</Text>
          <Text style={styles.menuValue}>{formatLastSynced(lastSyncedAt)}</Text>
        </View>
        <View style={styles.menuItem}>
          <Ionicons name="cloud-upload-outline" size={20} color="#94a3b8" />
          <Text style={styles.menuText}>Pending Uploads</Text>
          <Text
            style={[
              styles.menuValue,
              pendingSyncCount > 0 && { color: "#f59e0b" },
            ]}
          >
            {pendingSyncCount}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={syncNow}
          disabled={isSyncing || !isOnline}
        >
          <Ionicons
            name={isSyncing ? "sync" : "refresh-outline"}
            size={20}
            color={isOnline ? "#3b82f6" : "#475569"}
          />
          <Text
            style={[styles.menuText, { color: isOnline ? "#fff" : "#475569" }]}
          >
            {isSyncing ? "Syncing..." : "Force Sync"}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* Actions */}
      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={20} color="#94a3b8" />
          <Text style={styles.menuText}>Settings</Text>
          <Ionicons name="chevron-forward" size={16} color="#475569" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={20} color="#94a3b8" />
          <Text style={styles.menuText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={16} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>AssetsAlly v0.1.0 — Offline-First</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", padding: 20 },
  userCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#1e3a5f",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  name: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  email: { color: "#94a3b8", fontSize: 14, marginTop: 2 },
  roleBadge: {
    backgroundColor: "#3b82f620",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 10,
  },
  roleText: { color: "#60a5fa", fontSize: 12, fontWeight: "600" },
  menuSection: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  menuText: { flex: 1, color: "#fff", fontSize: 15 },
  menuValue: { color: "#94a3b8", fontSize: 13 },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#ef444415",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ef444430",
  },
  logoutText: { color: "#ef4444", fontSize: 15, fontWeight: "600" },
  version: {
    textAlign: "center",
    color: "#475569",
    fontSize: 12,
    marginTop: 24,
  },
});
