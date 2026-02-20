
import * as XLSX from "xlsx";
import * as path from "path";

const files = [
    "docs/samples/sample-inventory-import.xlsx",
    "docs/samples/sample-locations-import.xlsx"
];

const basePath = path.join("d:", "PROJECTS", "assetsally");

for (const file of files) {
    console.log(`--- ${file} ---`);
    const filePath = path.join(basePath, file);
    try {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        console.log(`Sheet: ${sheetName}`);
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        console.log("Headers:", Object.keys(data[0] || {}));
        console.log("Sample Row:", data[0]);
    } catch (e) {
        console.error(`Error reading ${file}:`, e.message);
    }
}
