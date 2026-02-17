import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";

import { mobileApi } from "../../lib/api";

const statusConfig: Record<string, { color: string; icon: string }> = {
  DRAFT: { color: "#94a3b8", icon: "create-outline" },
  SUBMITTED: { color: "#f59e0b", icon: "time-outline" },
  APPROVED: { color: "#22c55e", icon: "checkmark-circle-outline" },
  REJECTED: { color: "#ef4444", icon: "close-circle-outline" },
};

export default function AuditsTab() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAudits = useCallback(async () => {
    setLoading(true);
    try {
      const data = await mobileApi.getMyAudits();
      setReports(data.reports || []);
    } catch {}
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAudits();
    }, [loadAudits]),
  );

  const renderReport = ({ item }: { item: any }) => {
    const sc = statusConfig[item.status] || statusConfig.DRAFT;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/audit/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>
              {item.location?.name || "Unknown Location"}
            </Text>
            <Text style={styles.cardDate}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: sc.color + "20" }]}
          >
            <Ionicons name={sc.icon as any} size={14} color={sc.color} />
            <Text style={[styles.statusText, { color: sc.color }]}>
              {item.status}
            </Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <Ionicons name="document-text-outline" size={14} color="#64748b" />
          <Text style={styles.findingsCount}>
            {item._count?.findings || 0} findings
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
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
          <Text style={styles.emptySubtext}>Create one from the dashboard</Text>
        </View>
      )}
    </View>
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
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 12,
  },
  findingsCount: { color: "#64748b", fontSize: 12 },
  emptyText: { color: "#94a3b8", fontSize: 16, marginTop: 12 },
  emptySubtext: { color: "#64748b", fontSize: 13, marginTop: 4 },
});
