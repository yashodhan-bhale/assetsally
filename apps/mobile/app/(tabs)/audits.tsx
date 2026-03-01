import { Ionicons } from "@expo/vector-icons";
import { Q } from "@nozbe/watermelondb";
import { router, useFocusEffect } from "expo-router";
import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../contexts/auth-context";
import { useConnectivity } from "../../contexts/connectivity-context";
import { auditReportsCollection, locationsCollection } from "../../db";
import AuditReport from "../../db/models/AuditReport";
import { useSync } from "../../hooks/useSync";

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
  const [refreshing, setRefreshing] = useState(false);
  const [locationMap, setLocationMap] = useState<Record<string, string>>({});
  const { syncNow } = useSync();

  const loadAudits = useCallback(async () => {
    if (!refreshing) setLoading(true);
    try {
      const results = await auditReportsCollection
        .query(Q.where("auditor_id", user?.id || ""))
        .fetch();

      // Fetch location names for display
      const locIds = [...new Set(results.map((r) => r.locationId))];
      const locs = await locationsCollection
        .query(Q.where("server_id", Q.oneOf(locIds)))
        .fetch();

      const map: Record<string, string> = {};
      locs.forEach((l) => {
        map[l.serverId] = l.locationName;
      });
      setLocationMap(map);

      // Sort by created_at descending
      results.sort(
        (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0),
      );
      setReports(results);
    } catch (err) {
      console.error("Failed to load audits from local DB:", err);
    }
    setLoading(false);
    setRefreshing(false);
  }, [user?.id, refreshing]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (isOnline) {
      await syncNow();
    }
    await loadAudits();
  }, [isOnline, syncNow, loadAudits]);

  useFocusEffect(
    useCallback(() => {
      loadAudits();
    }, [loadAudits]),
  );

  const renderReport = ({ item }: { item: AuditReport }) => {
    const sc = statusConfig[item.status] || statusConfig.DRAFT;
    const locationName = locationMap[item.locationId] || item.locationId;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/audit/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{locationName}</Text>
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
      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : reports.length ? (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={renderReport}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3b82f6"
              colors={["#3b82f6"]}
            />
          }
        />
      ) : (
        <FlatList
          data={[]}
          renderItem={null}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="clipboard-outline" size={48} color="#475569" />
              <Text style={styles.emptyText}>No audit reports yet</Text>
              <Text style={styles.emptySubtext}>
                {isOnline
                  ? "Pull down to sync or create one from the dashboard"
                  : "Connect to internet to sync data"}
              </Text>
            </View>
          }
          contentContainerStyle={{ flex: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3b82f6"
              colors={["#3b82f6"]}
            />
          }
        />
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
