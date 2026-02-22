import { PrismaClient } from "@prisma/client";
const {
  InventoryService,
} = require("../apps/api/src/inventory/inventory.service");

async function main() {
  const prisma = new PrismaClient();
  const service = new InventoryService(prisma);
  try {
    const results = await service.findAll();
    console.log("Total items found by service:", results.pagination.total);
    console.log(
      "First item sample:",
      JSON.stringify(results.items[0], null, 2),
    );
  } catch (e) {
    console.error("Error in findAll:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
