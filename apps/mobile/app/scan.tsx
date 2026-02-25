import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";

import { mobileApi } from "../lib/api";

// Note: Real camera barcode scanning requires expo-camera which needs
// a physical device or emulator with camera support. This screen provides
// a manual QR code entry fallback with the scanning UI structure.

export default function ScanScreen() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const extractCode = (input: string) => {
    try {
      // If it's a URL, get the last part
      if (input.startsWith("http") || input.includes("//")) {
        const url = new URL(input);
        const parts = url.pathname.split("/");
        return parts[parts.length - 1]; // e.g /q/QR-1234 -> QR-1234
      }
    } catch {
      // Not a valid URL, treat as raw code
    }
    return input;
  };

  const lookupTag = async (scannedValue: string) => {
    setLoading(true);
    try {
      const tagIdentifier = extractCode(scannedValue);
      setCode(tagIdentifier);
      const data = await mobileApi.lookupQrTag(tagIdentifier);
      setResult(data);
    } catch (err: any) {
      Alert.alert("Tag Not Found", err.message || "Could not find this QR tag");
      setResult(null);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {/* Scanner area placeholder */}
      <View style={styles.scannerArea}>
        <View style={styles.scanFrame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          <Ionicons name="qr-code" size={64} color="#3b82f650" />
        </View>
        <Text style={styles.scanHint}>
          Point camera at QR tag or enter code manually
        </Text>
      </View>

      {/* Manual entry */}
      <View style={styles.manualSection}>
        <Text style={styles.sectionLabel}>Manual Entry</Text>
        <View style={styles.inputRow}>
          <View style={styles.input}>
            <Ionicons name="barcode-outline" size={20} color="#64748b" />
            <Text style={styles.inputPlaceholder}>
              {code || "Enter QR code..."}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.lookupBtn}
            onPress={() => {
              // Demo simulating a URL scan
              const testUrl = "https://myapp.com/q/QR-00001";
              setCode(testUrl);
              lookupTag(testUrl);
            }}
          >
            <Text style={styles.lookupBtnText}>
              {loading ? "..." : "Demo Lookup"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Result */}
      {result && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
            <Text style={styles.resultTitle}>Tag Found</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Code:</Text>
            <Text style={styles.resultValue}>{result.code}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Status:</Text>
            <Text
              style={[
                styles.resultValue,
                {
                  color: result.status === "ASSIGNED" ? "#22c55e" : "#f59e0b",
                },
              ]}
            >
              {result.status}
            </Text>
          </View>
          {result.linkedItem && (
            <>
              <View style={styles.divider} />
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Item:</Text>
                <Text style={styles.resultValue}>{result.linkedItem.name}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Location:</Text>
                <Text style={styles.resultValue}>
                  {result.linkedItem.location?.name || "—"}
                </Text>
              </View>
            </>
          )}
        </View>
      )}

      {/* Close */}
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <Text style={styles.closeBtnText}>Close Scanner</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", padding: 20 },
  scannerArea: { alignItems: "center", paddingVertical: 32 },
  scanFrame: {
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: "#3b82f6",
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  scanHint: { color: "#94a3b8", fontSize: 13, marginTop: 16 },
  manualSection: { marginBottom: 16 },
  sectionLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  inputRow: { flexDirection: "row", gap: 8 },
  input: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  inputPlaceholder: { color: "#64748b", fontSize: 14 },
  lookupBtn: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  lookupBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  resultCard: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 16,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  resultTitle: { color: "#22c55e", fontSize: 15, fontWeight: "600" },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  resultLabel: { color: "#64748b", fontSize: 13 },
  resultValue: { color: "#fff", fontSize: 13, fontWeight: "500" },
  divider: { height: 1, backgroundColor: "#334155", marginVertical: 8 },
  closeBtn: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  closeBtnText: { color: "#94a3b8", fontSize: 14, fontWeight: "500" },
});
