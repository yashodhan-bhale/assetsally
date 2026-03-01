import { Ionicons } from "@expo/vector-icons";
import { Q } from "@nozbe/watermelondb";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useConnectivity } from "../../contexts/connectivity-context";
import {
  getDatabase,
  auditReportsCollection,
  auditFindingsCollection,
  inventoryCollection,
  locationsCollection,
} from "../../db";
import AuditFinding from "../../db/models/AuditFinding";
import AuditReport from "../../db/models/AuditReport";
import InventoryItem from "../../db/models/InventoryItem";
import Location from "../../db/models/Location";
import { mobileApi } from "../../lib/api";

const statusConfig: Record<
  string,
  { color: string; icon: string; label: string }
> = {
  DRAFT: { color: "#94a3b8", icon: "create-outline", label: "Draft" },
  SUBMITTED: { color: "#f59e0b", icon: "time-outline", label: "Submitted" },
  APPROVED: {
    color: "#22c55e",
    icon: "checkmark-circle-outline",
    label: "Approved",
  },
  REJECTED: {
    color: "#ef4444",
    icon: "close-circle-outline",
    label: "Rejected",
  },
};

const verificationStatuses = [
  "FOUND",
  "NOT_FOUND",
  "RELOCATED",
  "DAMAGED",
  "DISPOSED",
];

const conditionOptions = ["GOOD", "FAIR", "POOR", "NON_FUNCTIONAL"];

export default function AuditDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isOnline } = useConnectivity();
  const [report, setReport] = useState<AuditReport | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [findings, setFindings] = useState<AuditFinding[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadReport = useCallback(async () => {
    if (!id) return;
    try {
      const reportRecord = await auditReportsCollection.find(id);
      setReport(reportRecord);

      // Load location
      try {
        const loc = await locationsCollection.find(reportRecord.locationId);
        setLocation(loc);
      } catch {
        setLocation(null);
      }

      // Load findings
      const findingsRecords = await auditFindingsCollection
        .query(Q.where("report_id", id))
        .fetch();
      setFindings(findingsRecords);

      // Load inventory items for the location
      const items = await inventoryCollection
        .query(Q.where("location_id", reportRecord.locationId))
        .fetch();
      setInventoryItems(items);
    } catch (err: any) {
      console.error("Failed to load report:", err);
      Alert.alert("Error", "Could not load report");
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleRecordFinding = async (
    item: InventoryItem,
    status: string,
    condition?: string,
  ) => {
    if (!report) return;

    try {
      // Check if finding already exists for this item
      const existing = findings.find((f) => f.itemId === item.id);

      await getDatabase().write(async () => {
        if (existing) {
          await existing.update((r: AuditFinding) => {
            r.status = status;
            r.condition = condition || null;
            r.needsSync = true;
          });
        } else {
          await auditFindingsCollection.create((r: AuditFinding) => {
            r.reportId = report.id;
            r.itemId = item.id;
            r.status = status;
            r.condition = condition || null;
            r.isLocallyCreated = true;
            r.needsSync = true;
          });
        }
      });

      await loadReport(); // Refresh
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to record finding");
    }
  };

  const handleSubmit = async () => {
    if (!report || !isOnline) {
      if (!isOnline) {
        Alert.alert(
          "Offline",
          "You must be online to submit a report for review.",
        );
      }
      return;
    }

    Alert.alert(
      "Submit Report",
      "Are you sure you want to submit this report for review?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit",
          style: "default",
          onPress: async () => {
            setSubmitting(true);
            try {
              const reportServerId = report.serverId || report.id;
              await mobileApi.submitReport(reportServerId);
              await getDatabase().write(async () => {
                await report.update((r: AuditReport) => {
                  r.status = "SUBMITTED";
                  r.submittedAt = Date.now();
                });
              });
              await loadReport();
              Alert.alert("Success", "Report submitted for review");
            } catch (err: any) {
              Alert.alert("Error", err.message);
            }
            setSubmitting(false);
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!report) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Report not found</Text>
      </View>
    );
  }

  const sc = statusConfig[report.status] || statusConfig.DRAFT;
  const findingsMap = new Map(findings.map((f) => [f.itemId, f]));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: 20 }}
      >
        {/* Offline Badge */}
        {!isOnline && (
          <View style={styles.offlineBadge}>
            <Ionicons name="cloud-offline-outline" size={14} color="#fca5a5" />
            <Text style={styles.offlineBadgeText}>
              Offline Mode — Changes saved locally
            </Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.headerCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.locationName}>
              {location?.locationName || report.locationId}
            </Text>
            {location && (
              <Text style={styles.locationCode}>{location.locationCode}</Text>
            )}
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: sc.color + "20" }]}
          >
            <Ionicons name={sc.icon as any} size={16} color={sc.color} />
            <Text style={[styles.statusText, { color: sc.color }]}>
              {sc.label}
            </Text>
          </View>
        </View>

        {/* Findings summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{inventoryItems.length}</Text>
            <Text style={styles.summaryLabel}>Items</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryNumber, { color: "#22c55e" }]}>
              {findings.length}
            </Text>
            <Text style={styles.summaryLabel}>Verified</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryNumber, { color: "#f59e0b" }]}>
              {inventoryItems.length - findings.length}
            </Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
        </View>

        {/* Inventory items with inline finding controls */}
        <Text style={styles.sectionTitle}>
          Inventory Items ({inventoryItems.length})
        </Text>

        {inventoryItems.length > 0 ? (
          inventoryItems.map((item) => {
            const finding = findingsMap.get(item.id);
            return (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.assetName}</Text>
                    <Text style={styles.itemNumber}>{item.assetNumber}</Text>
                  </View>
                  {finding && (
                    <View
                      style={[
                        styles.conditionBadge,
                        {
                          backgroundColor:
                            finding.status === "FOUND"
                              ? "#22c55e20"
                              : finding.status === "NOT_FOUND"
                                ? "#ef444420"
                                : "#f59e0b20",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.conditionText,
                          {
                            color:
                              finding.status === "FOUND"
                                ? "#22c55e"
                                : finding.status === "NOT_FOUND"
                                  ? "#ef4444"
                                  : "#f59e0b",
                          },
                        ]}
                      >
                        {finding.status}
                      </Text>
                    </View>
                  )}
                </View>

                {finding?.notes && (
                  <Text style={styles.findingNotes}>{finding.notes}</Text>
                )}

                <TouchableOpacity
                  style={styles.detailsBtn}
                  onPress={() =>
                    router.push({
                      pathname: "/audit/item/[itemId]",
                      params: { itemId: item.id, reportId: report.id },
                    })
                  }
                >
                  <Text style={styles.detailsBtnText}>
                    View Details & Record
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#3b82f6" />
                </TouchableOpacity>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyFindings}>
            <Ionicons name="cube-outline" size={32} color="#475569" />
            <Text style={styles.emptyText}>
              No inventory items for this location
            </Text>
            <Text style={styles.emptySubtext}>
              {isOnline ? "Sync to download items" : "Connect to sync data"}
            </Text>
          </View>
        )}

        {/* Actions */}
        {report.status === "DRAFT" && (
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={[
                styles.submitBtn,
                (submitting || !isOnline) && { opacity: 0.6 },
              ]}
              onPress={handleSubmit}
              disabled={submitting || !isOnline}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="send-outline" size={20} color="#fff" />
                  <Text style={styles.submitBtnText}>
                    {isOnline ? "Submit for Review" : "Go Online to Submit"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  center: { justifyContent: "center", alignItems: "center" },
  errorText: { color: "#ef4444", fontSize: 16 },
  offlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#7f1d1d",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  offlineBadgeText: { color: "#fca5a5", fontSize: 12, fontWeight: "600" },
  headerCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationName: { color: "#fff", fontSize: 18, fontWeight: "bold", flex: 1 },
  locationCode: { color: "#64748b", fontSize: 12, marginTop: 2 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: { fontSize: 12, fontWeight: "600" },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  summaryNumber: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  summaryLabel: { color: "#64748b", fontSize: 11, marginTop: 2 },
  sectionTitle: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  itemCard: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemName: { color: "#fff", fontSize: 14, fontWeight: "500" },
  itemNumber: { color: "#64748b", fontSize: 12, marginTop: 2 },
  conditionBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  conditionText: { fontSize: 11, fontWeight: "600" },
  findingNotes: { color: "#94a3b8", fontSize: 12, marginTop: 6 },
  detailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },
  detailsBtnText: { color: "#3b82f6", fontSize: 13, fontWeight: "600" },
  emptyFindings: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 16,
  },
  emptyText: { color: "#94a3b8", fontSize: 14, marginTop: 8 },
  emptySubtext: { color: "#64748b", fontSize: 12, marginTop: 4 },
  actionsSection: { gap: 10, marginTop: 8, marginBottom: 24 },

  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#22c55e",
    padding: 14,
    borderRadius: 12,
  },
  submitBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
