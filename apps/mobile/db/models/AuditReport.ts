import { Model } from "@nozbe/watermelondb";
import {
  field,
  text,
  date,
  readonly,
  children,
} from "@nozbe/watermelondb/decorators";

export default class AuditReport extends Model {
  static table = "audit_reports";

  static associations = {
    audit_findings: { type: "has_many" as const, foreignKey: "report_id" },
  };

  @text("server_id") serverId!: string | null;
  @text("location_id") locationId!: string;
  @text("auditor_id") auditorId!: string;
  @text("status") status!: string;
  @field("submitted_at") submittedAt!: number | null;
  @field("is_locally_created") isLocallyCreated!: boolean;
  @field("needs_sync") needsSync!: boolean;
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;

  @children("audit_findings") findings: any;
}
