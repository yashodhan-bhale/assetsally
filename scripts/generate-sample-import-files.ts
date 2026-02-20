/**
 * Generate sample Excel files for bulk import.
 *
 * Usage: npx ts-node scripts/generate-sample-import-files.ts
 *
 * Produces:
 *   docs/samples/sample-locations-import.xlsx
 *   docs/samples/sample-inventory-import.xlsx
 */

import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";

const OUTPUT_DIR = path.join(__dirname, "..", "docs", "samples");

// Ensure output directory exists
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ============================================================================
// 1. Locations Import File
// ============================================================================

const locationRows = [
  // Full 5-level hierarchy (HQ branch)
  {
    "L1 Code": "ACME",
    "L1 Name": "Acme Corporation",
    "L2 Code": "NORTH",
    "L2 Name": "North Region",
    "L3 Code": "DEL",
    "L3 Name": "Delhi",
    "L4 Code": "DEL-HQ",
    "L4 Name": "Delhi Head Office",
    "L5 Code": "DEL-HQ-F1",
    "L5 Name": "Floor 1",
  },
  {
    "L1 Code": "ACME",
    "L1 Name": "Acme Corporation",
    "L2 Code": "NORTH",
    "L2 Name": "North Region",
    "L3 Code": "DEL",
    "L3 Name": "Delhi",
    "L4 Code": "DEL-HQ",
    "L4 Name": "Delhi Head Office",
    "L5 Code": "DEL-HQ-F2",
    "L5 Name": "Floor 2",
  },
  {
    "L1 Code": "ACME",
    "L1 Name": "Acme Corporation",
    "L2 Code": "NORTH",
    "L2 Name": "North Region",
    "L3 Code": "DEL",
    "L3 Name": "Delhi",
    "L4 Code": "DEL-HQ",
    "L4 Name": "Delhi Head Office",
    "L5 Code": "DEL-HQ-F3",
    "L5 Name": "Floor 3",
  },
  // Another office in Delhi (ragged at L4, no L5)
  {
    "L1 Code": "ACME",
    "L1 Name": "Acme Corporation",
    "L2 Code": "NORTH",
    "L2 Name": "North Region",
    "L3 Code": "DEL",
    "L3 Name": "Delhi",
    "L4 Code": "DEL-WH",
    "L4 Name": "Delhi Warehouse",
    "L5 Code": "",
    "L5 Name": "",
  },
  // Jaipur branch (ragged at L3, no L4/L5)
  {
    "L1 Code": "ACME",
    "L1 Name": "Acme Corporation",
    "L2 Code": "NORTH",
    "L2 Name": "North Region",
    "L3 Code": "JAI",
    "L3 Name": "Jaipur Office",
    "L4 Code": "",
    "L4 Name": "",
    "L5 Code": "",
    "L5 Name": "",
  },
  // South Region (full depth)
  {
    "L1 Code": "ACME",
    "L1 Name": "Acme Corporation",
    "L2 Code": "SOUTH",
    "L2 Name": "South Region",
    "L3 Code": "BLR",
    "L3 Name": "Bangalore",
    "L4 Code": "BLR-TPC",
    "L4 Name": "Tech Park Campus",
    "L5 Code": "BLR-TPC-A",
    "L5 Name": "Building A",
  },
  {
    "L1 Code": "ACME",
    "L1 Name": "Acme Corporation",
    "L2 Code": "SOUTH",
    "L2 Name": "South Region",
    "L3 Code": "BLR",
    "L3 Name": "Bangalore",
    "L4 Code": "BLR-TPC",
    "L4 Name": "Tech Park Campus",
    "L5 Code": "BLR-TPC-B",
    "L5 Name": "Building B",
  },
  {
    "L1 Code": "ACME",
    "L1 Name": "Acme Corporation",
    "L2 Code": "SOUTH",
    "L2 Name": "South Region",
    "L3 Code": "CHN",
    "L3 Name": "Chennai",
    "L4 Code": "CHN-OFF",
    "L4 Name": "Chennai Office",
    "L5 Code": "",
    "L5 Name": "",
  },
  // West Region (ragged at L2, only one sub-location)
  {
    "L1 Code": "ACME",
    "L1 Name": "Acme Corporation",
    "L2 Code": "WEST",
    "L2 Name": "West Region",
    "L3 Code": "MUM",
    "L3 Name": "Mumbai",
    "L4 Code": "MUM-BKC",
    "L4 Name": "BKC Office",
    "L5 Code": "",
    "L5 Name": "",
  },
];

const locWb = XLSX.utils.book_new();
const locWs = XLSX.utils.json_to_sheet(locationRows);

// Set column widths
locWs["!cols"] = [
  { wch: 12 },
  { wch: 22 }, // L1
  { wch: 12 },
  { wch: 22 }, // L2
  { wch: 12 },
  { wch: 22 }, // L3
  { wch: 14 },
  { wch: 24 }, // L4
  { wch: 14 },
  { wch: 24 }, // L5
];

XLSX.utils.book_append_sheet(locWb, locWs, "Locations");
const locFile = path.join(OUTPUT_DIR, "sample-locations-import.xlsx");
XLSX.writeFile(locWb, locFile);
console.log(`✅ Created: ${locFile}`);

// ============================================================================
// 2. Inventory Import File (New Format)
// ============================================================================

const inventoryRows = [
  {
    "Sr No.": 1,
    "Profit Center": "3010",
    "Storage Location Code": "DEL-HQ-F1",
    Department: "IT",
    "Asset Number": "AST-0001",
    "Name of the Assets": "Dell Latitude 7440",
    "Descrption of Asset": '14" business laptop, i7, 16GB RAM',
    "Major Catogeory": "Laptops",
    "Minor Catogeory": "Plant",
    "Date of Put to use of asset": 41333,
    "Cost of Asset": 120000,
    "Accumulated Deprication": -20000,
    "Book Value": 100000,
    A: "EA",
    Status: "Found ok",
    "As per Books": 1,
  },
  {
    "Sr No.": 2,
    "Profit Center": "3010",
    "Storage Location Code": "DEL-HQ-F1",
    Department: "IT",
    "Asset Number": "AST-0002",
    "Name of the Assets": "Dell Monitor U2723QE",
    "Descrption of Asset": '27" 4K USB-C Monitor',
    "Major Catogeory": "Monitors",
    "Minor Catogeory": "Peripherals",
    "Date of Put to use of asset": 41500,
    "Cost of Asset": 45000,
    "Accumulated Deprication": -5000,
    "Book Value": 40000,
    A: "EA",
    Status: "Found ok",
    "As per Books": 1,
  },
];

const invWb = XLSX.utils.book_new();
const invWs = XLSX.utils.json_to_sheet(inventoryRows);

XLSX.utils.book_append_sheet(invWb, invWs, "Inventory Report ");
const invFile = path.join(OUTPUT_DIR, "sample-inventory-import.xlsx");
XLSX.writeFile(invWb, invFile);
console.log(`✅ Created: ${invFile}`);

console.log("\n📊 Summary:");
console.log(
  `   Locations: ${locationRows.length} rows (ragged tree with 5 levels)`,
);
console.log(
  `   Inventory: ${inventoryRows.length} items across multiple locations`,
);
console.log(`\n📝 Use these files with:`);
console.log(`   POST /api/locations/import  (locations file)`);
console.log(`   POST /api/inventory/import  (inventory file)`);
