import {
  schemaMigrations,
  addColumns,
  createTable,
} from "@nozbe/watermelondb/Schema/migrations";

export default schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        addColumns({
          table: "inventory_items",
          columns: [{ name: "needs_sync", type: "boolean" }],
        }),
        addColumns({
          table: "audit_reports",
          columns: [
            { name: "is_locally_created", type: "boolean" },
            { name: "needs_sync", type: "boolean" },
          ],
        }),
        addColumns({
          table: "audit_findings",
          columns: [
            { name: "is_locally_created", type: "boolean" },
            { name: "needs_sync", type: "boolean" },
          ],
        }),
        createTable({
          name: "sync_meta",
          columns: [
            { name: "key", type: "string" },
            { name: "value", type: "string" },
          ],
        }),
      ],
    },
  ],
});
