import { PrismaClient, AppType, UserStatus, QRTagStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@ratanrathi.co" },
    update: {},
    create: {
      email: "admin@ratanrathi.co",
      passwordHash: hashedPassword,
      name: "Ratan Rathi Admin",
      appType: AppType.ADMIN,
      role: "ADMIN",
      status: UserStatus.ACTIVE,
    },
  });
  console.log(`✅ Created admin user: ${adminUser.email}`);

  // Create a sample client user
  const clientUser = await prisma.user.upsert({
    where: { email: "client@demo.com" },
    update: {},
    create: {
      email: "client@demo.com",
      passwordHash: hashedPassword,
      name: "Demo Client",
      appType: AppType.CLIENT,
      role: "VIEWER",
      status: UserStatus.ACTIVE,
    },
  });
  console.log(`✅ Created client user: ${clientUser.email}`);

  // Create a sample auditor
  const auditorUser = await prisma.user.upsert({
    where: { email: "auditor@demo.com" },
    update: {},
    create: {
      email: "auditor@demo.com",
      passwordHash: hashedPassword,
      name: "Demo Auditor",
      appType: AppType.MOBILE,
      role: "AUDITOR",
      status: UserStatus.ACTIVE,
    },
  });
  console.log(`✅ Created auditor user: ${auditorUser.email}`);

  // Create sample location hierarchy
  let country = await prisma.location.findFirst({ where: { locationCode: "IN" } });
  if (!country) {
    country = await prisma.location.create({
      data: {
        locationCode: "IN",
        locationName: "India",
        path: "IN",
        depth: 0,
        levelLabel: "Country",
      },
    });
  }

  let state = await prisma.location.findFirst({ where: { locationCode: "MH" } });
  if (!state) {
    state = await prisma.location.create({
      data: {
        locationCode: "MH",
        locationName: "Maharashtra",
        path: "IN.MH",
        depth: 1,
        levelLabel: "State",
        parentId: country.id,
      },
    });
  }

  let city = await prisma.location.findFirst({ where: { locationCode: "MUM" } });
  if (!city) {
    city = await prisma.location.create({
      data: {
        locationCode: "MUM",
        locationName: "Mumbai",
        path: "IN.MH.MUM",
        depth: 2,
        levelLabel: "City",
        parentId: state.id,
      },
    });
  }

  let office = await prisma.location.findFirst({ where: { locationCode: "HQ" } });
  if (!office) {
    office = await prisma.location.create({
      data: {
        locationCode: "HQ",
        locationName: "HQ Office",
        path: "IN.MH.MUM.HQ",
        depth: 3,
        levelLabel: "Office",
        parentId: city.id,
      },
    });
  }
  console.log(
    `✅ Created location hierarchy: ${country.locationName} → ${state.locationName} → ${city.locationName} → ${office.locationName}`,
  );

  // Create sample department
  const department = await prisma.department.upsert({
    where: { code: "IT" },
    update: {},
    create: {
      code: "IT",
      name: "IT Department",
      description: "Information Technology Department",
    },
  });
  console.log(`✅ Created department: ${department.name}`);

  // Create sample asset category
  const category = await prisma.assetCategory.upsert({
    where: { code: "ELECTRONICS" },
    update: {},
    create: {
      code: "ELECTRONICS",
      name: "Electronics",
      description: "Electronic equipment and devices",
    },
  });
  console.log(`✅ Created category: ${category.name}`);

  // Create sample inventory items
  const items = [
    { assetName: "Dell Laptop", assetNumber: "ASSET-001" },
    { assetName: "Office Desk", assetNumber: "ASSET-002" },
    { assetName: "HP Printer", assetNumber: "ASSET-003" },
  ];

  for (const item of items) {
    await prisma.inventoryItem.upsert({
      where: { assetNumber: item.assetNumber },
      update: {},
      create: {
        assetNumber: item.assetNumber,
        assetName: item.assetName,
        locationId: office.id,
        departmentId: department.id,
        categoryId: category.id,
        customFields: {},
      },
    });
  }
  console.log(`✅ Created ${items.length} sample inventory items`);

  // Create sample QR tags
  for (let i = 1; i <= 5; i++) {
    await prisma.qRCodeTag.upsert({
      where: { code: `QR-${String(i).padStart(5, "0")}` },
      update: {},
      create: {
        code: `QR-${String(i).padStart(5, "0")}`,
        status: QRTagStatus.UNASSIGNED,
        batchId: "BATCH-001",
      },
    });
  }
  console.log(`✅ Created 5 sample QR tags (unassigned)`);

  console.log("\n🎉 Database seed completed successfully!");
  console.log("\n📝 Test credentials:");
  console.log("   Admin: admin@assetsally.com / admin123");
  console.log("   Client: client@demo.com / admin123");
  console.log("   Auditor: auditor@demo.com / admin123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
