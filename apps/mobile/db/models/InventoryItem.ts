import { Model } from "@nozbe/watermelondb";
import {
  field,
  text,
  date,
  readonly,
  json,
} from "@nozbe/watermelondb/decorators";

const sanitize = (raw: any) => (typeof raw === "object" ? raw : {});

export default class InventoryItem extends Model {
  static table = "inventory_items";

  @text("server_id") serverId!: string;
  @text("asset_number") assetNumber!: string;
  @text("asset_name") assetName!: string;
  @text("asset_description") assetDescription!: string | null;
  @text("location_id") locationId!: string;
  @text("department_name") departmentName!: string | null;
  @text("category_name") categoryName!: string | null;
  @field("acquisition_cost") acquisitionCost!: number | null;
  @field("net_book_value") netBookValue!: number | null;
  @field("quantity_as_per_books") quantityAsPerBooks!: number | null;
  @field("quantity_as_per_physical") quantityAsPerPhysical!: number | null;
  @field("quantity_difference") quantityDifference!: number | null;
  @text("biometric_tag") biometricTag!: string | null;
  @text("import_remarks") importRemarks!: string | null;
  @text("inventory_status") inventoryStatus!: string | null;
  @json("custom_fields", sanitize) customFields!: Record<string, any>;
  @text("profit_center") profitCenter!: string | null;
  @text("sub_category") subCategory!: string | null;
  @text("unit_of_measure") unitOfMeasure!: string | null;
  @field("needs_sync") needsSync!: boolean;
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;
}
