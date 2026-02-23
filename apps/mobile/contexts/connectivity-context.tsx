import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

interface ConnectivityContextType {
  isOnline: boolean;
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

  const setSyncing = useCallback((syncing: boolean) => {
    setIsSyncing(syncing);
  }, []);

  return (
    <ConnectivityContext.Provider
      value={{
        isOnline,
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
