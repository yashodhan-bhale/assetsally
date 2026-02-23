import { Model } from "@nozbe/watermelondb";
import {
  field,
  text,
  date,
  readonly,
  json,
  relation,
} from "@nozbe/watermelondb/decorators";

const sanitize = (raw: any) => (typeof raw === "object" ? raw : {});

export default class AuditFinding extends Model {
  static table = "audit_findings";

  static associations = {
    audit_reports: { type: "belongs_to" as const, key: "report_id" },
  };

  @text("server_id") serverId!: string | null;
  @text("report_id") reportId!: string;
  @text("item_id") itemId!: string;
  @text("status") status!: string;
  @text("condition") condition!: string | null;
  @text("notes") notes!: string | null;
  @field("geo_lat") geoLat!: number | null;
  @field("geo_lng") geoLng!: number | null;
  @field("geo_accuracy") geoAccuracy!: number | null;
  @json("custom_field_values", sanitize) customFieldValues!: Record<
    string,
    any
  >;
  @field("is_locally_created") isLocallyCreated!: boolean;
  @field("needs_sync") needsSync!: boolean;
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;

  @relation("audit_reports", "report_id") report: any;
}
