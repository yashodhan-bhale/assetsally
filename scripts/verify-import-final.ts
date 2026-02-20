
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import FormData from 'form-data';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3000/api';

async function main() {
    console.log('--- Starting Verification ---');

    try {
        // 1. Wipe existing data for a clean test
        console.log('Wiping existing data...');
        // We'll do it via Prisma directly instead of API for simplicity in script
        await prisma.inventoryItem.deleteMany();
        await prisma.location.deleteMany();
        await prisma.department.deleteMany();
        await prisma.assetCategory.deleteMany();

        // 2. Import Locations first (Location logic is unchanged)
        console.log('Importing locations...');
        const locPath = path.join(__dirname, '..', 'docs', 'samples', 'sample-locations-import.xlsx');

        // We need to bypass auth or use a token. 
        // Since it's a local dev environment, I'll check if I can just call the service method or 
        // if I should use axios. For verification, I'll use the Service directly to avoid auth setup complexity.
        // But the Service is inside NestJS.

        // Better: I'll manually create the required location for the inventory import
        const location = await prisma.location.create({
            data: {
                code: 'DEL-HQ-F1',
                name: 'Floor 1',
                path: 'ACME.NORTH.DEL.DEL-HQ.DEL-HQ-F1',
                depth: 4,
                levelLabel: 'Level 5'
            }
        });
        console.log(`Created location: ${location.code}`);

        // 3. Run Inventory Import using the updated Service logic
        console.log('Running inventory import...');
        const invPath = path.join(__dirname, '..', 'docs', 'samples', 'sample-inventory-import.xlsx');
        const fileBuffer = fs.readFileSync(invPath);

        // We'll mock the InventoryService call or just run a script that uses it.
        // I'll create a separate script that instantiates the prisma and runs the logic.
        // Actually, I can just copy the logic here for the verification script.

        const { InventoryService } = require('../apps/api/src/inventory/inventory.service');
        const invService = new InventoryService(prisma);

        const results = await invService.bulkImport(fileBuffer, 'sample-inventory-import.xlsx');
        console.log('Import Results:', JSON.stringify(results, null, 2));

        // 4. Verify data in DB
        console.log('\nVerifying data in DB...');
        const items = await prisma.inventoryItem.findMany({
            include: {
                location: true,
                department: true,
                category: true
            }
        });

        console.log(`Total items imported: ${items.length}`);
        for (const item of items) {
            console.log(`- [${item.code}] ${item.name}`);
            console.log(`  Location: ${item.location.name} (${item.location.code})`);
            console.log(`  Quantity: ${item.quantity}`);
            console.log(`  Accumulated Depr: ${item.accumulatedDepreciation}`);
            console.log(`  Major Category: ${item.category?.name}`);
            console.log(`  Status: ${item.status}`);
        }

        if (items.length === 2 && items[0].quantity === 1) {
            console.log('\n✅ Verification Successful!');
        } else {
            console.log('\n❌ Verification Failed: Unexpected item count or data mapping.');
        }

    } catch (error) {
        console.error('Verification Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
