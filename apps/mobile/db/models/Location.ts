import { Model } from "@nozbe/watermelondb";
import { field, text, date, readonly } from "@nozbe/watermelondb/decorators";

export default class Location extends Model {
  static table = "locations";

  @text("server_id") serverId!: string;
  @text("location_code") locationCode!: string;
  @text("location_name") locationName!: string;
  @text("description") description!: string | null;
  @text("path") path!: string;
  @field("depth") depth!: number;
  @text("level_label") levelLabel!: string;
  @text("parent_id") parentId!: string | null;
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;
}
