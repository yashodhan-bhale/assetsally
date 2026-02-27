import { Ionicons } from "@expo/vector-icons";
import { Q } from "@nozbe/watermelondb";
import { router, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../contexts/auth-context";
import { useConnectivity } from "../../contexts/connectivity-context";
import { auditReportsCollection } from "../../db";
import AuditReport from "../../db/models/AuditReport";

const statusConfig: Record<string, { color: string; icon: string }> = {
  DRAFT: { color: "#94a3b8", icon: "create-outline" },
  SUBMITTED: { color: "#f59e0b", icon: "time-outline" },
  APPROVED: { color: "#22c55e", icon: "checkmark-circle-outline" },
  REJECTED: { color: "#ef4444", icon: "close-circle-outline" },
};

export default function AuditsTab() {
  const { user } = useAuth();
  const { isOnline } = useConnectivity();
  const [reports, setReports] = useState<AuditReport[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAudits = useCallback(async () => {
    setLoading(true);
    try {
      const results = await auditReportsCollection
        .query(Q.where("auditor_id", user?.id || ""))
        .fetch();
      // Sort by created_at descending
      results.sort(
        (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0),
      );
      setReports(results);
    } catch (err) {
      console.error("Failed to load audits from local DB:", err);
    }
    setLoading(false);
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadAudits();
    }, [loadAudits]),
  );

  const renderReport = ({ item }: { item: AuditReport }) => {
    const sc = statusConfig[item.status] || statusConfig.DRAFT;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/audit/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.locationId}</Text>
            <Text style={styles.cardDate}>
              {item.createdAt?.toLocaleDateString() || ""}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            {item.needsSync && (
              <View style={styles.syncDot}>
                <Ionicons
                  name="cloud-upload-outline"
                  size={12}
                  color="#f59e0b"
                />
              </View>
            )}
            <View
              style={[styles.statusBadge, { backgroundColor: sc.color + "20" }]}
            >
              <Ionicons name={sc.icon as any} size={14} color={sc.color} />
              <Text style={[styles.statusText, { color: sc.color }]}>
                {item.status}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : reports.length ? (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={renderReport}
          contentContainerStyle={{ padding: 16, gap: 12 }}
        />
      ) : (
        <View style={styles.center}>
          <Ionicons name="clipboard-outline" size={48} color="#475569" />
          <Text style={styles.emptyText}>No audit reports yet</Text>
          <Text style={styles.emptySubtext}>
            {isOnline
              ? "Create one from the dashboard"
              : "Connect to internet to sync data"}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  cardDate: { color: "#64748b", fontSize: 12, marginTop: 2 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 11, fontWeight: "600" },
  syncDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#f59e0b20",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: { color: "#94a3b8", fontSize: 16, marginTop: 12 },
  emptySubtext: { color: "#64748b", fontSize: 13, marginTop: 4 },
});
