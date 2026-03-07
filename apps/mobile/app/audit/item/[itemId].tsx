import { Ionicons } from "@expo/vector-icons";
import { Q } from "@nozbe/watermelondb";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useConnectivity } from "../../../contexts/connectivity-context";
import {
  getDatabase,
  inventoryCollection,
  auditFindingsCollection,
} from "../../../db";
import InventoryItem from "../../../db/models/InventoryItem";
import { mobileApi } from "../../../lib/api";

export default function InventoryItemScreen() {
  const { itemId, reportId } = useLocalSearchParams<{
    itemId: string;
    reportId: string;
  }>();
  const { isOnline } = useConnectivity();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [physicalQty, setPhysicalQty] = useState("");
  const [biometricTag, setBiometricTag] = useState("");
  const [remarks, setRemarks] = useState("");
  const [inventoryStatus, setInventoryStatus] = useState("");
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const statusOptions = [
    "Found OK",
    "Excess",
    "Short",
    "Physically available, but not found",
    "Physically unavailable, but found",
    "Scrap/Obsolete/Damaged",
    "Asset not in use (idle)",
    "Asset not in use (held for sale)",
  ];

  useEffect(() => {
    async function loadItem() {
      try {
        const record = await inventoryCollection.find(itemId);
        setItem(record);
        setPhysicalQty(record.quantityAsPerPhysical?.toString() || "");
        setBiometricTag(record.biometricTag || "");
        setRemarks(record.importRemarks || "");
        setInventoryStatus(record.inventoryStatus || "");
      } catch (err) {
        console.error("Failed to load item:", err);
        Alert.alert("Error", "Could not load inventory item");
      }
      setLoading(false);
    }
    loadItem();
  }, [itemId]);

  const handleSave = async () => {
    if (!item || !reportId) return;

    setSaving(true);
    try {
      const db = getDatabase();
      await db.write(async () => {
        // 1. Update Inventory Item
        await item.update((r: any) => {
          r.quantityAsPerPhysical = parseInt(physicalQty) || null;
          r.biometricTag = biometricTag || null;
          r.importRemarks = remarks || null;
          r.inventoryStatus = inventoryStatus || null;
          r.needsSync = true;
          // Calculate difference if qty's are present
          if (
            r.quantityAsPerBooks !== null &&
            r.quantityAsPerPhysical !== null
          ) {
            r.quantityDifference =
              r.quantityAsPerPhysical - r.quantityAsPerBooks;
          }
        });

        // 2. Ensure an Audit Finding exists with status FOUND
        const existingFindings = await auditFindingsCollection
          .query(Q.where("item_id", itemId), Q.where("report_id", reportId))
          .fetch();
        const finding =
          existingFindings.length > 0 ? existingFindings[0] : null;

        if (finding) {
          await finding.update((r: any) => {
            r.status = "FOUND";
            r.notes = remarks || null;
            r.needsSync = true;
          });
        } else {
          await auditFindingsCollection.create((r: any) => {
            r.reportId = reportId;
            r.itemId = itemId;
            r.status = "FOUND";
            r.notes = remarks || null;
            r.isLocallyCreated = true;
            r.needsSync = true;
          });
        }
      });

      Alert.alert("Success", "Information saved successfully");
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save data");
    }
    setSaving(false);
  };

  const handleStatusSelect = () => {
    Alert.alert(
      "Select Inventory Status",
      "Choose the current status of the asset",
      [
        ...statusOptions.map((status) => ({
          text: status,
          onPress: () => setInventoryStatus(status),
        })),
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const handleBindQR = () => {
    router.push({
      pathname: "/scan",
      params: { itemId, reportId },
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Item not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ padding: 20 }}
        >
          {/* Header Info */}
          <View style={styles.card}>
            <Text style={styles.label}>Asset Name</Text>
            <Text style={styles.value}>{item.assetName}</Text>

            <View style={[styles.row, { marginTop: 12 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Asset Number</Text>
                <Text style={styles.value}>{item.assetNumber}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>UOM</Text>
                <Text style={styles.value}>{item.unitOfMeasure || "-"}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Category</Text>
                <Text style={styles.value}>{item.categoryName || "-"}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Sub Category</Text>
                <Text style={styles.value}>{item.subCategory || "-"}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Department</Text>
                <Text style={styles.value}>{item.departmentName || "-"}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Profit Center</Text>
                <Text style={styles.value}>{item.profitCenter || "-"}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Acquisition Cost</Text>
                <Text style={styles.value}>
                  {item.acquisitionCost !== null
                    ? item.acquisitionCost.toLocaleString()
                    : "-"}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Net Book Value</Text>
                <Text style={styles.value}>
                  {item.netBookValue !== null
                    ? item.netBookValue.toLocaleString()
                    : "-"}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Capitalization Date</Text>
                <Text style={styles.value}>
                  {item.capitalizationDate
                    ? item.capitalizationDate.toLocaleDateString()
                    : "-"}
                </Text>
              </View>
            </View>
          </View>

          {/* Quantity Section */}
          <Text style={styles.sectionTitle}>Verification Details</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Qty as per Books</Text>
                <Text style={styles.value}>
                  {item.quantityAsPerBooks ?? "-"}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Difference</Text>
                <Text
                  style={[
                    styles.value,
                    (item.quantityDifference ?? 0) < 0
                      ? { color: "#ef4444" }
                      : { color: "#22c55e" },
                  ]}
                >
                  {item.quantityDifference ?? "-"}
                </Text>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Physical Quantity
              </Text>
              <TextInput
                style={styles.input}
                value={physicalQty}
                onChangeText={setPhysicalQty}
                placeholder="Enter physical quantity"
                keyboardType="numeric"
                placeholderTextColor="#64748b"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Inventory Status</Text>
              <TouchableOpacity
                style={styles.pickerTrigger}
                onPress={handleStatusSelect}
              >
                <Text
                  style={[
                    styles.pickerText,
                    !inventoryStatus && { color: "#64748b" },
                  ]}
                >
                  {inventoryStatus || "Select Status"}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Metadata Section */}
          <Text style={styles.sectionTitle}>Additional Info</Text>
          <View style={styles.card}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Biometric Tag</Text>
              <TextInput
                style={styles.input}
                value={biometricTag}
                onChangeText={setBiometricTag}
                placeholder="Enter tag number"
                placeholderTextColor="#64748b"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Remarks</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={remarks}
                onChangeText={setRemarks}
                placeholder="Enter observations"
                multiline
                numberOfLines={3}
                placeholderTextColor="#64748b"
              />
            </View>
          </View>

          {/* Bind QR Button */}
          <TouchableOpacity style={styles.bindBtn} onPress={handleBindQR}>
            <Ionicons name="qr-code-outline" size={20} color="#fff" />
            <Text style={styles.bindBtnText}>Bind QR Code</Text>
          </TouchableOpacity>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#fff" />
                <Text style={styles.saveBtnText}>Save Finding</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  center: { justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 20,
  },
  row: { flexDirection: "row", marginBottom: 12, gap: 12 },
  label: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  value: { color: "#fff", fontSize: 14, fontWeight: "500" },
  sectionTitle: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  inputContainer: { marginBottom: 16 },
  inputLabel: { color: "#94a3b8", fontSize: 13, marginBottom: 8 },
  input: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 12,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#334155",
    fontSize: 15,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  pickerTrigger: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#334155",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pickerText: { color: "#fff", fontSize: 15 },
  errorText: { color: "#ef4444", fontSize: 16, fontWeight: "500" },
  bindBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#3b82f6",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  bindBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#22c55e",
    padding: 14,
    borderRadius: 12,
  },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
