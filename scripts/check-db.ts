import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("--- Database Check ---");
  try {
    const userCount = await prisma.user.count();
    console.log(`Total users in DB: ${userCount}`);

    const inventoryCount = await prisma.inventoryItem.count();
    console.log(`Total inventory items in DB: ${inventoryCount}`);

    const locationCount = await prisma.location.count();
    console.log(`Total locations in DB: ${locationCount}`);

    const deptCount = await prisma.department.count();
    console.log(`Total departments in DB: ${deptCount}`);

    const users = await prisma.user.findMany({
      select: {
        email: true,
        appType: true,
        role: true,
        status: true,
        passwordHash: true,
      },
    });

    console.log("\nUser details:");
    for (const user of users) {
      console.log(
        `- ${user.email} (${user.appType}/${user.role}) [${user.status}]`,
      );
      const isMatch = await bcrypt.compare("admin123", user.passwordHash);
      console.log(
        `  Password 'admin123' check: ${isMatch ? "✅ MATCH" : "❌ FAIL"}`,
      );
    }

    const inventoryItems = await prisma.inventoryItem.findMany({
      include: {
        location: true,
        department: true,
        category: true,
      },
    });

    console.log("\nInventory Items:");
    for (const item of inventoryItems) {
      console.log(
        `- [${item.code}] ${item.name} (${item.category?.name || "No Category"}) at ${item.location.name}`,
      );
    }
  } catch (error) {
    console.error("Error checking DB:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
