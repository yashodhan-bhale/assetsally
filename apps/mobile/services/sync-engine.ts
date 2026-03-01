import { Q } from "@nozbe/watermelondb";

import {
  getDatabase,
  locationsCollection,
  inventoryCollection,
  auditReportsCollection,
  auditFindingsCollection,
  syncMetaCollection,
} from "../db";
import AuditFinding from "../db/models/AuditFinding";
import AuditReport from "../db/models/AuditReport";
import InventoryItem from "../db/models/InventoryItem";
import Location from "../db/models/Location";
import { mobileApi } from "../lib/api";

// ─── Helpers ───────────────────────────────────────────────────────────────────

async function getSyncMeta(key: string): Promise<string | null> {
  const records = await syncMetaCollection.query(Q.where("key", key)).fetch();
  return records.length > 0 ? records[0].value : null;
}

async function setSyncMeta(key: string, value: string): Promise<void> {
  const records = await syncMetaCollection.query(Q.where("key", key)).fetch();
  const db = getDatabase();
  await db.write(async () => {
    if (records.length > 0) {
      await records[0].update((r) => {
        r.value = value;
      });
    } else {
      await syncMetaCollection.create((r) => {
        r.key = key;
        r.value = value;
      });
    }
  });
}

// ─── Pull (Server → Local) ────────────────────────────────────────────────────

/**
 * Pulls all data relevant to the current auditor from the server into
 * the local WatermelonDB. This includes:
 *   1. Locations (the auditor's assigned subtree)
 *   2. Inventory items for those locations
 *   3. Audit reports assigned to this auditor
 *   4. Audit findings for those reports
 */
export async function pullData(userId: string): Promise<void> {
  console.log("[SyncEngine] Starting pull...");
  const db = getDatabase();

  // 1. Pull locations
  const locationsData = await mobileApi.getLocations();
  const locations: any[] = Array.isArray(locationsData)
    ? locationsData
    : locationsData?.items || locationsData?.data || [];

  await db.write(async () => {
    for (const loc of locations) {
      const existing = await locationsCollection
        .query(Q.where("server_id", loc.id))
        .fetch();

      if (existing.length > 0) {
        await existing[0].update((r: Location) => {
          r.locationCode = loc.locationCode;
          r.locationName = loc.locationName;
          r.description = loc.description || null;
          r.path = loc.path;
          r.depth = loc.depth;
          r.levelLabel = loc.levelLabel;
          r.parentId = loc.parentId || null;
        });
      } else {
        await locationsCollection.create((r: Location) => {
          r._raw.id = loc.id; // Use server UUID as local ID
          r.serverId = loc.id;
          r.locationCode = loc.locationCode;
          r.locationName = loc.locationName;
          r.description = loc.description || null;
          r.path = loc.path;
          r.depth = loc.depth;
          r.levelLabel = loc.levelLabel;
          r.parentId = loc.parentId || null;
        });
      }
    }
  });

  console.log(`[SyncEngine] Pulled ${locations.length} locations`);

  // 2. Pull inventory for each location
  let totalItems = 0;
  for (const loc of locations) {
    try {
      const invData = await mobileApi.getInventoryByLocation(loc.id);
      const items: any[] = invData?.items || [];

      if (items.length === 0) continue;

      await db.write(async () => {
        for (const item of items) {
          const existing = await inventoryCollection
            .query(Q.where("server_id", item.id))
            .fetch();

          const writeItem = (r: InventoryItem) => {
            r.serverId = item.id;
            r.assetNumber = item.assetNumber;
            r.assetName = item.assetName;
            r.assetDescription = item.assetDescription || null;
            r.locationId = item.locationId;
            r.departmentName = item.department?.name || null;
            r.categoryName = item.category?.name || null;
            r.acquisitionCost = item.acquisitionCost
              ? Number(item.acquisitionCost)
              : null;
            r.netBookValue = item.netBookValue
              ? Number(item.netBookValue)
              : null;
            r.quantityAsPerBooks = item.quantityAsPerBooks || null;
            r.quantityAsPerPhysical = item.quantityAsPerPhysical || null;
            r.quantityDifference = item.quantityDifference || null;
            r.biometricTag = item.biometricTag || null;
            r.importRemarks = item.importRemarks || null;
            r.inventoryStatus = item.inventoryStatus || null;
            r.profitCenter = item.profitCenter || null;
            r.subCategory = item.subCategory || null;
            r.unitOfMeasure = item.unitOfMeasure || null;
            r.needsSync = false;
          };

          if (existing.length > 0) {
            await existing[0].update(writeItem);
          } else {
            await inventoryCollection.create((r: InventoryItem) => {
              r._raw.id = item.id;
              writeItem(r);
            });
          }
        }
      });

      totalItems += items.length;
    } catch (err) {
      console.warn(
        `[SyncEngine] Failed to pull inventory for location ${loc.id}:`,
        err,
      );
    }
  }

  console.log(`[SyncEngine] Pulled ${totalItems} inventory items`);

  // 3. Pull audit reports for this auditor
  try {
    const auditsData = await mobileApi.getMyAudits({ auditorId: userId });
    const reports: any[] = auditsData?.reports || [];
    console.log(
      `[SyncEngine] Received ${reports.length} audit reports from server`,
    );

    await db.write(async () => {
      for (const report of reports) {
        const existing = await auditReportsCollection
          .query(Q.where("server_id", report.id))
          .fetch();

        const writeReport = (r: AuditReport) => {
          r.serverId = report.id;
          r.locationId = report.locationId;
          r.auditorId = report.auditorId;
          r.status = report.status;
          r.submittedAt = report.submittedAt
            ? new Date(report.submittedAt).getTime()
            : null;
          r.isLocallyCreated = false;
          r.needsSync = false;
        };

        if (existing.length > 0) {
          // Only update server-sourced reports that don't have local changes
          if (!existing[0].needsSync) {
            await existing[0].update(writeReport);
          }
        } else {
          await auditReportsCollection.create((r: AuditReport) => {
            r._raw.id = report.id;
            writeReport(r);
          });
        }
      }
    });

    console.log(`[SyncEngine] Pulled ${reports.length} audit reports`);

    // 4. Pull findings for each report
    let totalFindings = 0;
    for (const report of reports) {
      try {
        const reportDetail = await mobileApi.getAudit(report.id);
        const findings: any[] = reportDetail?.findings || [];

        if (findings.length === 0) continue;

        await db.write(async () => {
          for (const finding of findings) {
            const existing = await auditFindingsCollection
              .query(Q.where("server_id", finding.id))
              .fetch();

            const writeFinding = (r: AuditFinding) => {
              r.serverId = finding.id;
              r.reportId = report.id;
              r.itemId = finding.itemId || finding.item?.id;
              r.status = finding.status;
              r.condition = finding.condition || null;
              r.notes = finding.notes || null;
              r.geoLat = finding.geoLat || null;
              r.geoLng = finding.geoLng || null;
              r.geoAccuracy = finding.geoAccuracy || null;
              r.isLocallyCreated = false;
              r.needsSync = false;
            };

            if (existing.length > 0) {
              if (!existing[0].needsSync) {
                await existing[0].update(writeFinding);
              }
            } else {
              await auditFindingsCollection.create((r: AuditFinding) => {
                r._raw.id = finding.id;
                writeFinding(r);
              });
            }
          }
        });

        totalFindings += findings.length;
      } catch (err) {
        console.warn(
          `[SyncEngine] Failed to pull findings for report ${report.id}:`,
          err,
        );
      }
    }

    console.log(`[SyncEngine] Pulled ${totalFindings} findings`);
  } catch (err) {
    console.warn("[SyncEngine] Failed to pull audit reports:", err);
  }

  await setSyncMeta("last_pulled_at", new Date().toISOString());
  console.log("[SyncEngine] Pull complete");
}

// ─── Push (Local → Server) ─────────────────────────────────────────────────────

/**
 * Pushes locally-created/modified records to the server.
 * Returns the number of items successfully synced.
 */
export async function pushData(): Promise<number> {
  console.log("[SyncEngine] Starting push...");
  const db = getDatabase();
  let synced = 0;

  // 1. Push new audit reports
  const dirtyReports = await auditReportsCollection
    .query(Q.where("needs_sync", true))
    .fetch();

  for (const report of dirtyReports) {
    try {
      if (report.isLocallyCreated && !report.serverId) {
        // Create on server
        const serverReport = await mobileApi.createAudit(report.locationId);
        await db.write(async () => {
          await report.update((r: AuditReport) => {
            r.serverId = serverReport.id;
            // Removed _raw.id remapping as it's immutable in WatermelonDB
            r.needsSync = false;
            r.isLocallyCreated = false;
          });
        });
        synced++;
      }
    } catch (err) {
      console.warn(`[SyncEngine] Failed to push report ${report.id}:`, err);
    }
  }

  // 2. Push dirty findings
  const dirtyFindings = await auditFindingsCollection
    .query(Q.where("needs_sync", true))
    .fetch();

  for (const finding of dirtyFindings) {
    try {
      // Ensure the report has a server ID
      const report = await auditReportsCollection.find(finding.reportId);
      const reportServerId = report.serverId || finding.reportId;

      if (!reportServerId) {
        console.warn(
          `[SyncEngine] Skipping finding: report ${finding.reportId} has no server ID`,
        );
        continue;
      }

      await mobileApi.submitFinding(reportServerId, {
        itemId: finding.itemId,
        status: finding.status,
        condition: finding.condition || undefined,
        notes: finding.notes || undefined,
        geoLat: finding.geoLat || undefined,
        geoLng: finding.geoLng || undefined,
        geoAccuracy: finding.geoAccuracy || undefined,
        customFieldValues: finding.customFieldValues || {},
      });

      await db.write(async () => {
        await finding.update((r: AuditFinding) => {
          r.needsSync = false;
          r.isLocallyCreated = false;
        });
      });
      synced++;
    } catch (err) {
      console.warn(`[SyncEngine] Failed to push finding ${finding.id}:`, err);
    }
  }

  // 3. Push dirty inventory items (QR binding or physical qty updates)
  const dirtyItems = await inventoryCollection
    .query(Q.where("needs_sync", true))
    .fetch();

  for (const item of dirtyItems) {
    try {
      await mobileApi.updateInventoryItem(item.serverId, {
        quantityAsPerPhysical: item.quantityAsPerPhysical || undefined,
        quantityDifference: item.quantityDifference || undefined,
        biometricTag: item.biometricTag || undefined,
        importRemarks: item.importRemarks || undefined,
      });

      await db.write(async () => {
        await item.update((r: InventoryItem) => {
          r.needsSync = false;
        });
      });
      synced++;
    } catch (err) {
      console.warn(`[SyncEngine] Failed to push item ${item.id}:`, err);
    }
  }

  if (synced > 0) {
    await setSyncMeta("last_pushed_at", new Date().toISOString());
  }

  console.log(`[SyncEngine] Push complete. Synced ${synced} items.`);
  return synced;
}

// ─── Utilities ─────────────────────────────────────────────────────────────────

/** Count records that need syncing */
export async function getPendingSyncCount(): Promise<number> {
  try {
    const dirtyReports = await auditReportsCollection
      .query(Q.where("needs_sync", true))
      .fetchCount();
    const dirtyFindings = await auditFindingsCollection
      .query(Q.where("needs_sync", true))
      .fetchCount();
    const dirtyItems = await inventoryCollection
      .query(Q.where("needs_sync", true))
      .fetchCount();
    return dirtyReports + dirtyFindings + dirtyItems;
  } catch (error: any) {
    if (error?.message?.includes("no such column")) {
      console.error(
        "[SyncEngine] Corrupted schema detected, resetting database...",
      );
      await clearLocalData();
      return 0;
    }
    throw error;
  }
}

/** Get last synced time */
export async function getLastSyncedAt(): Promise<Date | null> {
  const pulled = await getSyncMeta("last_pulled_at");
  const pushed = await getSyncMeta("last_pushed_at");

  // Return the more recent of the two
  const dates = [pulled, pushed]
    .filter(Boolean)
    .map((d) => new Date(d!))
    .sort((a, b) => b.getTime() - a.getTime());

  return dates.length > 0 ? dates[0] : null;
}

/** Clear all local data (for logout) */
export async function clearLocalData(): Promise<void> {
  const db = getDatabase();
  await db.write(async () => {
    await db.unsafeResetDatabase();
  });
  console.log("[SyncEngine] Local data cleared");
}
