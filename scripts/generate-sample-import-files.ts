/**
 * Generate sample Excel files for bulk import.
 *
 * Usage: npx ts-node scripts/generate-sample-import-files.ts
 *
 * Produces:
 *   docs/samples/sample-locations-import.xlsx
 *   docs/samples/sample-inventory-import.xlsx
 */

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'samples');

// Ensure output directory exists
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ============================================================================
// 1. Locations Import File
// ============================================================================

const locationRows = [
    // Full 5-level hierarchy (HQ branch)
    {
        'L1 Code': 'ACME', 'L1 Name': 'Acme Corporation',
        'L2 Code': 'NORTH', 'L2 Name': 'North Region',
        'L3 Code': 'DEL', 'L3 Name': 'Delhi',
        'L4 Code': 'DEL-HQ', 'L4 Name': 'Delhi Head Office',
        'L5 Code': 'DEL-HQ-F1', 'L5 Name': 'Floor 1',
    },
    {
        'L1 Code': 'ACME', 'L1 Name': 'Acme Corporation',
        'L2 Code': 'NORTH', 'L2 Name': 'North Region',
        'L3 Code': 'DEL', 'L3 Name': 'Delhi',
        'L4 Code': 'DEL-HQ', 'L4 Name': 'Delhi Head Office',
        'L5 Code': 'DEL-HQ-F2', 'L5 Name': 'Floor 2',
    },
    {
        'L1 Code': 'ACME', 'L1 Name': 'Acme Corporation',
        'L2 Code': 'NORTH', 'L2 Name': 'North Region',
        'L3 Code': 'DEL', 'L3 Name': 'Delhi',
        'L4 Code': 'DEL-HQ', 'L4 Name': 'Delhi Head Office',
        'L5 Code': 'DEL-HQ-F3', 'L5 Name': 'Floor 3',
    },
    // Another office in Delhi (ragged at L4, no L5)
    {
        'L1 Code': 'ACME', 'L1 Name': 'Acme Corporation',
        'L2 Code': 'NORTH', 'L2 Name': 'North Region',
        'L3 Code': 'DEL', 'L3 Name': 'Delhi',
        'L4 Code': 'DEL-WH', 'L4 Name': 'Delhi Warehouse',
        'L5 Code': '', 'L5 Name': '',
    },
    // Jaipur branch (ragged at L3, no L4/L5)
    {
        'L1 Code': 'ACME', 'L1 Name': 'Acme Corporation',
        'L2 Code': 'NORTH', 'L2 Name': 'North Region',
        'L3 Code': 'JAI', 'L3 Name': 'Jaipur Office',
        'L4 Code': '', 'L4 Name': '',
        'L5 Code': '', 'L5 Name': '',
    },
    // South Region (full depth)
    {
        'L1 Code': 'ACME', 'L1 Name': 'Acme Corporation',
        'L2 Code': 'SOUTH', 'L2 Name': 'South Region',
        'L3 Code': 'BLR', 'L3 Name': 'Bangalore',
        'L4 Code': 'BLR-TPC', 'L4 Name': 'Tech Park Campus',
        'L5 Code': 'BLR-TPC-A', 'L5 Name': 'Building A',
    },
    {
        'L1 Code': 'ACME', 'L1 Name': 'Acme Corporation',
        'L2 Code': 'SOUTH', 'L2 Name': 'South Region',
        'L3 Code': 'BLR', 'L3 Name': 'Bangalore',
        'L4 Code': 'BLR-TPC', 'L4 Name': 'Tech Park Campus',
        'L5 Code': 'BLR-TPC-B', 'L5 Name': 'Building B',
    },
    {
        'L1 Code': 'ACME', 'L1 Name': 'Acme Corporation',
        'L2 Code': 'SOUTH', 'L2 Name': 'South Region',
        'L3 Code': 'CHN', 'L3 Name': 'Chennai',
        'L4 Code': 'CHN-OFF', 'L4 Name': 'Chennai Office',
        'L5 Code': '', 'L5 Name': '',
    },
    // West Region (ragged at L2, only one sub-location)
    {
        'L1 Code': 'ACME', 'L1 Name': 'Acme Corporation',
        'L2 Code': 'WEST', 'L2 Name': 'West Region',
        'L3 Code': 'MUM', 'L3 Name': 'Mumbai',
        'L4 Code': 'MUM-BKC', 'L4 Name': 'BKC Office',
        'L5 Code': '', 'L5 Name': '',
    },
];

const locWb = XLSX.utils.book_new();
const locWs = XLSX.utils.json_to_sheet(locationRows);

// Set column widths
locWs['!cols'] = [
    { wch: 12 }, { wch: 22 },  // L1
    { wch: 12 }, { wch: 22 },  // L2
    { wch: 12 }, { wch: 22 },  // L3
    { wch: 14 }, { wch: 24 },  // L4
    { wch: 14 }, { wch: 24 },  // L5
];

XLSX.utils.book_append_sheet(locWb, locWs, 'Locations');
const locFile = path.join(OUTPUT_DIR, 'sample-locations-import.xlsx');
XLSX.writeFile(locWb, locFile);
console.log(`✅ Created: ${locFile}`);


// ============================================================================
// 2. Inventory Import File
// ============================================================================

const inventoryRows = [
    // Dell Laptops at Delhi HQ Floor 1
    { 'Asset Code': 'AST-0001', 'Asset Name': 'Dell Latitude 7440', 'Location Code': 'DEL-HQ-F1', 'Department': 'IT', 'Category': 'Laptops', 'Description': '14" business laptop, i7, 16GB RAM' },
    { 'Asset Code': 'AST-0002', 'Asset Name': 'Dell Latitude 7440', 'Location Code': 'DEL-HQ-F1', 'Department': 'IT', 'Category': 'Laptops', 'Description': '14" business laptop, i7, 16GB RAM' },
    { 'Asset Code': 'AST-0003', 'Asset Name': 'Dell Monitor U2723QE', 'Location Code': 'DEL-HQ-F1', 'Department': 'IT', 'Category': 'Monitors', 'Description': '27" 4K USB-C Monitor' },
    { 'Asset Code': 'AST-0004', 'Asset Name': 'HP LaserJet Pro M404n', 'Location Code': 'DEL-HQ-F1', 'Department': 'Admin', 'Category': 'Printers', 'Description': 'B&W Laser Printer' },

    // Furniture at Delhi HQ Floor 2
    { 'Asset Code': 'AST-0005', 'Asset Name': 'Herman Miller Aeron', 'Location Code': 'DEL-HQ-F2', 'Department': 'HR', 'Category': 'Furniture', 'Description': 'Ergonomic office chair, Size B' },
    { 'Asset Code': 'AST-0006', 'Asset Name': 'Standing Desk Pro', 'Location Code': 'DEL-HQ-F2', 'Department': 'HR', 'Category': 'Furniture', 'Description': 'Electric sit-stand desk 60x30"' },
    { 'Asset Code': 'AST-0007', 'Asset Name': 'Logitech Rally Plus', 'Location Code': 'DEL-HQ-F2', 'Department': 'IT', 'Category': 'AV Equipment', 'Description': 'Video conferencing system' },

    // Delhi Warehouse
    { 'Asset Code': 'AST-0008', 'Asset Name': 'Forklift Toyota 8FGU25', 'Location Code': 'DEL-WH', 'Department': 'Operations', 'Category': 'Machinery', 'Description': '5000 lb capacity forklift' },
    { 'Asset Code': 'AST-0009', 'Asset Name': 'Pallet Racking System', 'Location Code': 'DEL-WH', 'Department': 'Operations', 'Category': 'Storage', 'Description': '4-tier selective pallet rack' },

    // Bangalore Tech Park Building A
    { 'Asset Code': 'AST-0010', 'Asset Name': 'MacBook Pro 16" M3', 'Location Code': 'BLR-TPC-A', 'Department': 'Engineering', 'Category': 'Laptops', 'Description': 'Apple Silicon, 36GB RAM, 1TB SSD' },
    { 'Asset Code': 'AST-0011', 'Asset Name': 'MacBook Pro 16" M3', 'Location Code': 'BLR-TPC-A', 'Department': 'Engineering', 'Category': 'Laptops', 'Description': 'Apple Silicon, 36GB RAM, 1TB SSD' },
    { 'Asset Code': 'AST-0012', 'Asset Name': 'Dell PowerEdge R750', 'Location Code': 'BLR-TPC-A', 'Department': 'Engineering', 'Category': 'Servers', 'Description': 'Rack server, dual Xeon, 512GB RAM' },
    { 'Asset Code': 'AST-0013', 'Asset Name': 'Cisco Catalyst 9300', 'Location Code': 'BLR-TPC-A', 'Department': 'IT', 'Category': 'Networking', 'Description': '48-port managed switch' },

    // Bangalore Tech Park Building B
    { 'Asset Code': 'AST-0014', 'Asset Name': 'Dell Latitude 5540', 'Location Code': 'BLR-TPC-B', 'Department': 'Sales', 'Category': 'Laptops', 'Description': '15.6" business laptop, i5, 8GB RAM' },
    { 'Asset Code': 'AST-0015', 'Asset Name': 'Brother MFC-L8900CDW', 'Location Code': 'BLR-TPC-B', 'Department': 'Sales', 'Category': 'Printers', 'Description': 'Color laser all-in-one' },

    // Chennai Office
    { 'Asset Code': 'AST-0016', 'Asset Name': 'Lenovo ThinkPad X1', 'Location Code': 'CHN-OFF', 'Department': 'Finance', 'Category': 'Laptops', 'Description': '14" ultrabook, i7, 16GB RAM' },
    { 'Asset Code': 'AST-0017', 'Asset Name': 'Epson WorkForce Pro', 'Location Code': 'CHN-OFF', 'Department': 'Finance', 'Category': 'Printers', 'Description': 'Inkjet MFP with fax' },
    { 'Asset Code': 'AST-0018', 'Asset Name': 'APC Smart-UPS 3000', 'Location Code': 'CHN-OFF', 'Department': 'IT', 'Category': 'Power', 'Description': '3000VA line-interactive UPS' },

    // Mumbai BKC Office
    { 'Asset Code': 'AST-0019', 'Asset Name': 'HP EliteBook 840 G10', 'Location Code': 'MUM-BKC', 'Department': 'Legal', 'Category': 'Laptops', 'Description': '14" secure laptop, i7, 32GB RAM' },
    { 'Asset Code': 'AST-0020', 'Asset Name': 'Shredder Fellowes 225i', 'Location Code': 'MUM-BKC', 'Department': 'Legal', 'Category': 'Office Equip', 'Description': 'Cross-cut paper shredder, 20-sheet' },

    // Jaipur Office
    { 'Asset Code': 'AST-0021', 'Asset Name': 'Dell OptiPlex 7010', 'Location Code': 'JAI', 'Department': 'Support', 'Category': 'Desktops', 'Description': 'SFF desktop, i5, 16GB RAM' },
    { 'Asset Code': 'AST-0022', 'Asset Name': 'Dell OptiPlex 7010', 'Location Code': 'JAI', 'Department': 'Support', 'Category': 'Desktops', 'Description': 'SFF desktop, i5, 16GB RAM' },
    { 'Asset Code': 'AST-0023', 'Asset Name': 'Xerox VersaLink C405', 'Location Code': 'JAI', 'Department': 'Support', 'Category': 'Printers', 'Description': 'Color laser MFP' },
    { 'Asset Code': 'AST-0024', 'Asset Name': 'Projector Epson EB-992F', 'Location Code': 'JAI', 'Department': 'Support', 'Category': 'AV Equipment', 'Description': 'Full HD 1080p wireless projector' },
    { 'Asset Code': 'AST-0025', 'Asset Name': 'Whiteboard 6x4', 'Location Code': 'JAI', 'Department': 'Support', 'Category': 'Furniture', 'Description': 'Magnetic dry-erase whiteboard' },
];

const invWb = XLSX.utils.book_new();
const invWs = XLSX.utils.json_to_sheet(inventoryRows);

// Set column widths
invWs['!cols'] = [
    { wch: 14 },  // Asset Code
    { wch: 30 },  // Asset Name
    { wch: 16 },  // Location Code
    { wch: 14 },  // Department
    { wch: 16 },  // Category
    { wch: 45 },  // Description
];

XLSX.utils.book_append_sheet(invWb, invWs, 'Inventory');
const invFile = path.join(OUTPUT_DIR, 'sample-inventory-import.xlsx');
XLSX.writeFile(invWb, invFile);
console.log(`✅ Created: ${invFile}`);

console.log('\n📊 Summary:');
console.log(`   Locations: ${locationRows.length} rows (ragged tree with 5 levels)`);
console.log(`   Inventory: ${inventoryRows.length} items across multiple locations`);
console.log(`\n📝 Use these files with:`);
console.log(`   POST /api/locations/import  (locations file)`);
console.log(`   POST /api/inventory/import  (inventory file)`);
