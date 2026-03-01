import { appSchema, tableSchema } from "@nozbe/watermelondb";

export const SCHEMA_VERSION = 2;

export default appSchema({
  version: SCHEMA_VERSION,
  tables: [
    tableSchema({
      name: "locations",
      columns: [
        { name: "server_id", type: "string" },
        { name: "location_code", type: "string" },
        { name: "location_name", type: "string" },
        { name: "description", type: "string", isOptional: true },
        { name: "path", type: "string" },
        { name: "depth", type: "number" },
        { name: "level_label", type: "string" },
        { name: "parent_id", type: "string", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "inventory_items",
      columns: [
        { name: "server_id", type: "string" },
        { name: "asset_number", type: "string" },
        { name: "asset_name", type: "string" },
        { name: "asset_description", type: "string", isOptional: true },
        { name: "location_id", type: "string" },
        { name: "department_name", type: "string", isOptional: true },
        { name: "category_name", type: "string", isOptional: true },
        { name: "acquisition_cost", type: "number", isOptional: true },
        { name: "net_book_value", type: "number", isOptional: true },
        { name: "quantity_as_per_books", type: "number", isOptional: true },
        { name: "quantity_as_per_physical", type: "number", isOptional: true },
        { name: "quantity_difference", type: "number", isOptional: true },
        { name: "biometric_tag", type: "string", isOptional: true },
        { name: "import_remarks", type: "string", isOptional: true },
        { name: "inventory_status", type: "string", isOptional: true },
        { name: "custom_fields", type: "string" }, // JSON stringified
        { name: "profit_center", type: "string", isOptional: true },
        { name: "sub_category", type: "string", isOptional: true },
        { name: "unit_of_measure", type: "string", isOptional: true },
        { name: "needs_sync", type: "boolean" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "audit_reports",
      columns: [
        { name: "server_id", type: "string", isOptional: true },
        { name: "location_id", type: "string" },
        { name: "auditor_id", type: "string" },
        { name: "status", type: "string" }, // DRAFT | SUBMITTED | APPROVED | REJECTED
        { name: "submitted_at", type: "number", isOptional: true },
        { name: "is_locally_created", type: "boolean" },
        { name: "needs_sync", type: "boolean" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "audit_findings",
      columns: [
        { name: "server_id", type: "string", isOptional: true },
        { name: "report_id", type: "string" },
        { name: "item_id", type: "string" },
        { name: "status", type: "string" }, // PENDING | FOUND | NOT_FOUND | RELOCATED | DAMAGED | DISPOSED
        { name: "condition", type: "string", isOptional: true }, // GOOD | FAIR | POOR | NON_FUNCTIONAL
        { name: "notes", type: "string", isOptional: true },
        { name: "geo_lat", type: "number", isOptional: true },
        { name: "geo_lng", type: "number", isOptional: true },
        { name: "geo_accuracy", type: "number", isOptional: true },
        { name: "custom_field_values", type: "string" }, // JSON stringified
        { name: "is_locally_created", type: "boolean" },
        { name: "needs_sync", type: "boolean" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "sync_meta",
      columns: [
        { name: "key", type: "string" },
        { name: "value", type: "string" },
      ],
    }),
  ],
});
