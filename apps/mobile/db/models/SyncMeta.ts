import { Model } from "@nozbe/watermelondb";
import { text } from "@nozbe/watermelondb/decorators";

export default class SyncMeta extends Model {
  static table = "sync_meta";

  @text("key") key!: string;
  @text("value") value!: string;
}
