import * as XLSX from "xlsx";
import * as path from "path";

const filePath = path.join(
  "d:",
  "PROJECTS",
  "assetsally",
  "docs",
  "samples",
  "sample-inventory-import.xlsx",
);
const workbook = XLSX.readFile(filePath);
console.log("Sheet Names:", workbook.SheetNames);

for (const sheetName of workbook.SheetNames) {
  console.log(`--- Sheet: ${sheetName} ---`);
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  console.log("Headers:", Object.keys(data[0] || {}));
  if (data.length > 0) {
    console.log("Sample Row:", data[0]);
  }
}
