import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

import { useConnectivity } from "../contexts/connectivity-context";

function formatLastSynced(date: Date | null): string {
  if (!date) return "Never";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return date.toLocaleDateString();
}

export default function SyncStatusBar() {
  const {
    isOnline,
    isApiReachable,
    isSyncing,
    lastSyncedAt,
    pendingSyncCount,
  } = useConnectivity();

  let bgColor: string;
  let textColor: string;
  let icon: string;
  let message: string;

  if (!isOnline) {
    bgColor = "#7f1d1d";
    textColor = "#fca5a5";
    icon = "cloud-offline-outline";
    message = `Offline — ${pendingSyncCount > 0 ? `${pendingSyncCount} changes saved locally` : "Changes saved locally"}`;
  } else if (!isApiReachable) {
    bgColor = "#7f1d1d";
    textColor = "#fca5a5";
    icon = "alert-circle-outline";
    message = "Server Down — Cannot sync data";
  } else if (isSyncing) {
    bgColor = "#78350f";
    textColor = "#fde68a";
    icon = "sync-outline";
    message = `Syncing${pendingSyncCount > 0 ? ` ${pendingSyncCount} items` : ""}...`;
  } else if (pendingSyncCount > 0) {
    bgColor = "#78350f";
    textColor = "#fde68a";
    icon = "alert-circle-outline";
    message = `${pendingSyncCount} changes pending sync`;
  } else {
    bgColor = "#14532d";
    textColor = "#86efac";
    icon = "checkmark-circle-outline";
    message = `Online — Synced ${formatLastSynced(lastSyncedAt)}`;
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {isSyncing ? (
        <ActivityIndicator size={12} color={textColor} />
      ) : (
        <Ionicons name={icon as any} size={14} color={textColor} />
      )}
      <Text style={[styles.text, { color: textColor }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
});
