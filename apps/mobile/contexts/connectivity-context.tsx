import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

import { API_BASE } from "../lib/api";

interface ConnectivityContextType {
  isOnline: boolean;
  isApiReachable: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  pendingSyncCount: number;
  setSyncing: (syncing: boolean) => void;
  setLastSyncedAt: (date: Date | null) => void;
  setPendingSyncCount: (count: number) => void;
}

const ConnectivityContext = createContext<ConnectivityContextType | undefined>(
  undefined,
);

export function ConnectivityProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isApiReachable, setIsApiReachable] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsOnline(!!state.isConnected && !!state.isInternetReachable);
    });

    // Initial check
    NetInfo.fetch().then((state) => {
      setIsOnline(!!state.isConnected && !!state.isInternetReachable);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isOnline) {
      setIsApiReachable(false);
      return;
    }

    const checkApi = async () => {
      try {
        // We can't easily import getApiBase here without refactoring, so we'll just use a timeout fetch
        // Or we can just let the next API call update this if we had a global interceptor
        // For now, let's do a simple fetch to health endpoint
        // I'll need to know the API_BASE. It's defined in apps/mobile/lib/api.ts
        // Since I'm in a context, I'll just assume a reasonable default or skip for now if too complex
        // Actually, let's use a simplified version of health check
        const response = await fetch(`${API_BASE}/health`, {
          method: "GET",
        }).catch(() => null);
        setIsApiReachable(!!response && response.ok);
      } catch (e) {
        setIsApiReachable(false);
      }
    };

    checkApi();
    const interval = setInterval(checkApi, 30000);
    return () => clearInterval(interval);
  }, [isOnline]);

  const setSyncing = useCallback((syncing: boolean) => {
    setIsSyncing(syncing);
  }, []);

  return (
    <ConnectivityContext.Provider
      value={{
        isOnline,
        isApiReachable,
        isSyncing,
        lastSyncedAt,
        pendingSyncCount,
        setSyncing,
        setLastSyncedAt,
        setPendingSyncCount,
      }}
    >
      {children}
    </ConnectivityContext.Provider>
  );
}

export function useConnectivity() {
  const ctx = useContext(ConnectivityContext);
  if (!ctx)
    throw new Error("useConnectivity must be used within ConnectivityProvider");
  return ctx;
}
