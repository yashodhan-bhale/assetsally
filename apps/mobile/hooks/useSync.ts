import { useCallback, useEffect, useRef } from "react";

import { useAuth } from "../contexts/auth-context";
import { useConnectivity } from "../contexts/connectivity-context";
import {
  pullData,
  pushData,
  getPendingSyncCount,
  getLastSyncedAt,
} from "../services/sync-engine";

const PUSH_INTERVAL_MS = 30_000; // 30 seconds

/**
 * Hook that manages the sync lifecycle:
 * - Triggers initial pull on mount (after login)
 * - Polls for dirty records to push when online
 * - Exposes manual syncNow() trigger
 */
export function useSync() {
  const { user } = useAuth();
  const {
    isOnline,
    isSyncing,
    setSyncing,
    setLastSyncedAt,
    setPendingSyncCount,
  } = useConnectivity();

  const pushIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Update pending count periodically
  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getPendingSyncCount();
      setPendingSyncCount(count);
    } catch (err) {
      console.warn("[useSync] Failed to get pending count:", err);
    }
  }, [setPendingSyncCount]);

  // Full sync: pull then push
  const syncNow = useCallback(async () => {
    if (!user || isSyncing) return;

    setSyncing(true);
    try {
      if (isOnline) {
        // Pull first, then push
        await pullData(user.id);
        await pushData();

        const syncedAt = await getLastSyncedAt();
        setLastSyncedAt(syncedAt);
      }
      await refreshPendingCount();
    } catch (err) {
      console.error("[useSync] Sync failed:", err);
    } finally {
      setSyncing(false);
    }
  }, [
    user,
    isOnline,
    isSyncing,
    setSyncing,
    setLastSyncedAt,
    refreshPendingCount,
  ]);

  // Auto-push when online
  const autoPush = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    const pending = await getPendingSyncCount();
    if (pending === 0) return;

    setSyncing(true);
    try {
      await pushData();
      const syncedAt = await getLastSyncedAt();
      setLastSyncedAt(syncedAt);
      await refreshPendingCount();
    } catch (err) {
      console.warn("[useSync] Auto-push failed:", err);
    } finally {
      setSyncing(false);
    }
  }, [isOnline, isSyncing, setSyncing, setLastSyncedAt, refreshPendingCount]);

  // Initial sync on login
  useEffect(() => {
    if (user && isOnline) {
      syncNow();
    }
    // Only run on user change (login/logout), not when isOnline changes
  }, [user?.id]);

  // When connectivity is restored, trigger push
  useEffect(() => {
    if (isOnline && user) {
      autoPush();
    }
  }, [isOnline]);

  // Periodic push interval
  useEffect(() => {
    if (user) {
      pushIntervalRef.current = setInterval(() => {
        autoPush();
        refreshPendingCount();
      }, PUSH_INTERVAL_MS);
    }

    return () => {
      if (pushIntervalRef.current) {
        clearInterval(pushIntervalRef.current);
        pushIntervalRef.current = null;
      }
    };
  }, [user?.id]);

  return {
    syncNow,
    refreshPendingCount,
  };
}
