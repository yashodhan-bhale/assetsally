import { Database, Collection, Model } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";

import migrations from "./migrations";
import {
  Location,
  InventoryItem,
  AuditReport,
  AuditFinding,
  SyncMeta,
} from "./models";
import schema from "./schema";

let _database: Database | null = null;

/**
 * Lazily initialize the database. This avoids crashing in Expo Go
 * where WatermelonDB's JSI native modules are not available.
 *
 * If a migration error is detected (e.g. partial migration left the DB
 * in an inconsistent state), we destroy and recreate the database so
 * the app can start fresh with correct schema.
 */
export function getDatabase(): Database {
  if (!_database) {
    const adapter = new SQLiteAdapter({
      schema,
      migrations,
      jsi: true,
      onSetUpError: async (error) => {
        console.error(
          "[WatermelonDB] Setup error — resetting database:",
          error,
        );
        // Database is in an unrecoverable state (e.g. partial migration).
        // Wipe it so the next launch creates tables from the current schema.
        try {
          const resetAdapter = new SQLiteAdapter({
            schema,
            // No migrations — just create from scratch
            jsi: true,
          });
          const tempDb = new Database({
            adapter: resetAdapter,
            modelClasses: [
              Location,
              InventoryItem,
              AuditReport,
              AuditFinding,
              SyncMeta,
            ],
          });
          await tempDb.write(async () => {
            await tempDb.unsafeResetDatabase();
          });
          console.log(
            "[WatermelonDB] Database reset successful — please reload the app",
          );
        } catch (resetError) {
          console.error("[WatermelonDB] Failed to reset database:", resetError);
        }
      },
    });

    _database = new Database({
      adapter,
      modelClasses: [
        Location,
        InventoryItem,
        AuditReport,
        AuditFinding,
        SyncMeta,
      ],
    });
  }
  return _database;
}

// Convenience collection accessors — these are lazy proxies that
// forward all property access to the real WatermelonDB Collection.
// They exist so importing code doesn't trigger database init at import time.

function lazyCollection<T extends typeof Model>(tableName: string) {
  return new Proxy({} as Collection<InstanceType<T>>, {
    get(_target, prop) {
      const collection = getDatabase().get<InstanceType<T>>(tableName);
      const value = (collection as any)[prop];
      if (typeof value === "function") {
        return value.bind(collection);
      }
      return value;
    },
  });
}

export const locationsCollection = lazyCollection<typeof Location>("locations");
export const inventoryCollection =
  lazyCollection<typeof InventoryItem>("inventory_items");
export const auditReportsCollection =
  lazyCollection<typeof AuditReport>("audit_reports");
export const auditFindingsCollection =
  lazyCollection<typeof AuditFinding>("audit_findings");
export const syncMetaCollection = lazyCollection<typeof SyncMeta>("sync_meta");

export default {
  get instance() {
    return getDatabase();
  },
};
