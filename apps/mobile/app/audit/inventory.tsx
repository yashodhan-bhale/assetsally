import { Ionicons } from "@expo/vector-icons";
import { Q } from "@nozbe/watermelondb";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useConnectivity } from "../../contexts/connectivity-context";
import { inventoryCollection, locationsCollection } from "../../db";
import InventoryItem from "../../db/models/InventoryItem";
import Location from "../../db/models/Location";

export default function InventoryScreen() {
  const { locationId } = useLocalSearchParams<{ locationId: string }>();
  const { isOnline } = useConnectivity();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [locationId]);

  const loadData = async () => {
    if (!locationId) return;
    try {
      const loc = await locationsCollection.find(locationId);
      setLocation(loc);

      const results = await inventoryCollection
        .query(Q.where("location_id", locationId))
        .fetch();
      results.sort((a, b) => a.assetNumber.localeCompare(b.assetNumber));
      setItems(results);
    } catch (err) {
      console.error("Failed to load inventory:", err);
    }
    setLoading(false);
  };

  const renderItem = ({ item }: { item: InventoryItem }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.flex1}>
          <Text style={styles.itemName}>{item.assetName}</Text>
          <Text style={styles.itemNumber}>{item.assetNumber}</Text>
        </View>
        {item.inventoryStatus && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.inventoryStatus}</Text>
          </View>
        )}
      </View>
      <View style={styles.detailsRow}>
        {item.departmentName && (
          <View style={styles.detailChip}>
            <Ionicons name="business-outline" size={12} color="#64748b" />
            <Text style={styles.detailText}>{item.departmentName}</Text>
          </View>
        )}
        {item.categoryName && (
          <View style={styles.detailChip}>
            <Ionicons name="pricetag-outline" size={12} color="#64748b" />
            <Text style={styles.detailText}>{item.categoryName}</Text>
          </View>
        )}
        {item.quantityAsPerBooks != null && (
          <View style={styles.detailChip}>
            <Ionicons name="layers-outline" size={12} color="#64748b" />
            <Text style={styles.detailText}>
              Qty: {item.quantityAsPerBooks}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Location header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {location?.locationName || "Location"}
        </Text>
        <Text style={styles.headerSubtitle}>
          {location?.locationCode} · {items.length} items
          {!isOnline && " · Offline"}
        </Text>
      </View>

      {items.length > 0 ? (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, gap: 8 }}
        />
      ) : (
        <View style={styles.center}>
          <Ionicons name="cube-outline" size={48} color="#475569" />
          <Text style={styles.emptyText}>No inventory items</Text>
          <Text style={styles.emptySubtext}>
            {isOnline ? "Sync to download items" : "Connect to sync data"}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  flex1: { flex: 1 },
  header: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  headerSubtitle: { color: "#64748b", fontSize: 13, marginTop: 2 },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemName: { color: "#fff", fontSize: 14, fontWeight: "500" },
  itemNumber: { color: "#64748b", fontSize: 12, marginTop: 2 },
  statusBadge: {
    backgroundColor: "#3b82f620",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: { color: "#60a5fa", fontSize: 11, fontWeight: "600" },
  detailsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  detailChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#0f172a",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  detailText: { color: "#94a3b8", fontSize: 11 },
  emptyText: { color: "#94a3b8", fontSize: 16, marginTop: 12 },
  emptySubtext: { color: "#64748b", fontSize: 13, marginTop: 4 },
});
