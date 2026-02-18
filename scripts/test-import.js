const fs = require("fs");
const path = require("path");

const API_URL = "http://127.0.0.1:3001/api";
const LOCATIONS_FILE = path.join(
  __dirname,
  "../docs/samples/sample-locations-import.xlsx",
);
const INVENTORY_FILE = path.join(
  __dirname,
  "../docs/samples/sample-inventory-import.xlsx",
);

async function test() {
  console.log("1. Logging in...");
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@assetsally.com",
      password: "admin123",
      appType: "ADMIN",
    }),
  });

  if (!loginRes.ok) {
    throw new Error(
      `Login failed: ${loginRes.status} ${await loginRes.text()}`,
    );
  }

  const { accessToken } = await loginRes.json();
  console.log("   Logged in successfully.");

  // 2. Import Locations
  console.log("2. Importing locations...");
  const locFormData = new FormData();
  const locBlob = new Blob([fs.readFileSync(LOCATIONS_FILE)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  locFormData.append("file", locBlob, "sample-locations-import.xlsx");

  const locRes = await fetch(`${API_URL}/locations/import`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: locFormData,
  });

  if (!locRes.ok) {
    console.error(
      `   Locations import failed: ${locRes.status} ${await locRes.text()}`,
    );
  } else {
    console.log("   Locations import result:", await locRes.json());
  }

  // 3. Import Inventory
  console.log("3. Importing inventory...");
  const invFormData = new FormData();
  const invBlob = new Blob([fs.readFileSync(INVENTORY_FILE)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  invFormData.append("file", invBlob, "sample-inventory-import.xlsx");

  const invRes = await fetch(`${API_URL}/inventory/import`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: invFormData,
  });

  if (!invRes.ok) {
    console.error(
      `   Inventory import failed: ${invRes.status} ${await invRes.text()}`,
    );
  } else {
    console.log("   Inventory import result:", await invRes.json());
  }
}

test().catch(console.error);
