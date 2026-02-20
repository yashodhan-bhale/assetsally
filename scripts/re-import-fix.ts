import { PrismaClient, AppType, UserStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

async function main() {
    const prisma = new PrismaClient();
    console.log('--- Reseting Data & Re-importing Properly ---');

    try {
        // 0. Ensure Admin User exists
        console.log('Checking for admin user...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await prisma.user.upsert({
            where: { email: 'admin@assetsally.com' },
            update: {},
            create: {
                email: 'admin@assetsally.com',
                passwordHash: hashedPassword,
                name: 'System Admin',
                appType: AppType.ADMIN,
                role: 'ADMIN',
                status: UserStatus.ACTIVE,
            },
        });
        console.log('Admin user ensured.');

        // 1. Wipe data
        await prisma.inventoryItem.deleteMany();
        await prisma.location.deleteMany();
        await prisma.department.deleteMany();
        await prisma.assetCategory.deleteMany();
        await prisma.hierarchyConfig.deleteMany();

        // 2. Initialize Hierarchy Labels
        console.log('Initializing hierarchy labels...');
        await prisma.hierarchyConfig.createMany({
            data: [
                { level: 0, label: 'Zone' },
                { level: 1, label: 'Division' },
                { level: 2, label: 'Subdivision' },
                { level: 3, label: 'Substation' }
            ]
        });

        // 3. Import Locations using Service
        console.log('Importing locations via Service...');
        const { LocationsService } = require('../apps/api/src/locations/locations.service');
        const locService = new LocationsService(prisma);

        const locPath = path.join(__dirname, '..', 'docs', 'samples', 'sample-locations-import.xlsx');
        const locBuffer = fs.readFileSync(locPath);
        const locResults = await locService.bulkImport(locBuffer, 'sample-locations-import.xlsx');
        console.log('Location Import Results:', locResults);

        // 4. Unlock ALL locations
        await prisma.location.updateMany({
            data: { isLocked: false }
        });
        console.log('Unlocked all locations.');

        // 5. Import Inventory using Service
        console.log('Importing inventory via Service...');
        const { InventoryService } = require('../apps/api/src/inventory/inventory.service');
        const invService = new InventoryService(prisma);

        const invPath = path.join(__dirname, '..', 'docs', 'samples', 'sample-inventory-import.xlsx');
        const invBuffer = fs.readFileSync(invPath);
        const invResults = await invService.bulkImport(invBuffer, 'sample-inventory-import.xlsx');
        console.log('Inventory Import Results:', invResults);

        // 6. Assign Admin User to the root Location
        const admin = await prisma.user.findUnique({ where: { email: 'admin@assetsally.com' } });
        const rootLoc = await prisma.location.findFirst({ where: { depth: 0 } });
        if (admin && rootLoc) {
            await prisma.user.update({
                where: { id: admin.id },
                data: {
                    assignedLocation: {
                        connect: { id: rootLoc.id }
                    }
                }
            });
            console.log(`Assigned admin to root location: ${rootLoc.locationCode}`);
        }

        console.log('\n✅ Re-import Complete! Please check the UI now.');

    } catch (error) {
        console.error('Error during re-import:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
