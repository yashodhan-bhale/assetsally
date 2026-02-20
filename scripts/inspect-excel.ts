
import * as XLSX from "xlsx";
import * as path from "path";

const samplesDir = path.join("d:", "PROJECTS", "assetsally", "docs", "samples");

function checkHeaders() {
    const filePath = path.join(samplesDir, "sample-inventory-import.xlsx");
    const workbook = XLSX.readFile(filePath);

    workbook.SheetNames.forEach(name => {
        const sheet = workbook.Sheets[name];
        const data = XLSX.utils.sheet_to_json(sheet);
        console.log(`\nSheet: ${name}`);
        console.log("Headers:", Object.keys(data[0] || {}));
    });
}

checkHeaders();
