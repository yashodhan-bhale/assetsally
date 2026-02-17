import { PrismaClient, AppType, UserStatus, QRTagStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.upsert({
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
    console.log(`✅ Created admin user: ${adminUser.email}`);

    // Create a sample client user
    const clientUser = await prisma.user.upsert({
        where: { email: 'client@demo.com' },
        update: {},
        create: {
            email: 'client@demo.com',
            passwordHash: hashedPassword,
            name: 'Demo Client',
            appType: AppType.CLIENT,
            role: 'VIEWER',
            status: UserStatus.ACTIVE,
        },
    });
    console.log(`✅ Created client user: ${clientUser.email}`);

    // Create a sample auditor
    const auditorUser = await prisma.user.upsert({
        where: { email: 'auditor@demo.com' },
        update: {},
        create: {
            email: 'auditor@demo.com',
            passwordHash: hashedPassword,
            name: 'Demo Auditor',
            appType: AppType.MOBILE,
            role: 'AUDITOR',
            status: UserStatus.ACTIVE,
        },
    });
    console.log(`✅ Created auditor user: ${auditorUser.email}`);

    // Create sample location hierarchy
    // Create sample location hierarchy
    let country = await prisma.location.findFirst({ where: { code: 'IN' } });
    if (!country) {
        country = await prisma.location.create({
            data: {
                code: 'IN',
                name: 'India',
                path: 'IN',
                depth: 0,
                levelLabel: 'Country',
            },
        });
    }

    let state = await prisma.location.findFirst({ where: { code: 'MH' } });
    if (!state) {
        state = await prisma.location.create({
            data: {
                code: 'MH',
                name: 'Maharashtra',
                path: 'IN.MH',
                depth: 1,
                levelLabel: 'State',
                parentId: country.id,
            },
        });
    }

    let city = await prisma.location.findFirst({ where: { code: 'MUM' } });
    if (!city) {
        city = await prisma.location.create({
            data: {
                code: 'MUM',
                name: 'Mumbai',
                path: 'IN.MH.MUM',
                depth: 2,
                levelLabel: 'City',
                parentId: state.id,
            },
        });
    }

    let office = await prisma.location.findFirst({ where: { code: 'HQ' } });
    if (!office) {
        office = await prisma.location.create({
            data: {
                code: 'HQ',
                name: 'HQ Office',
                path: 'IN.MH.MUM.HQ',
                depth: 3,
                levelLabel: 'Office',
                parentId: city.id,
            },
        });
    }
    console.log(`✅ Created location hierarchy: ${country.name} → ${state.name} → ${city.name} → ${office.name}`);

    // Create sample department
    const department = await prisma.department.upsert({
        where: { code: 'IT' },
        update: {},
        create: {
            code: 'IT',
            name: 'IT Department',
            description: 'Information Technology Department',
        },
    });
    console.log(`✅ Created department: ${department.name}`);

    // Create sample asset category
    const category = await prisma.assetCategory.upsert({
        where: { code: 'ELECTRONICS' },
        update: {},
        create: {
            code: 'ELECTRONICS',
            name: 'Electronics',
            description: 'Electronic equipment and devices',
        },
    });
    console.log(`✅ Created category: ${category.name}`);

    // Create sample inventory items
    const items = [
        { name: 'Dell Laptop', code: 'ASSET-001' },
        { name: 'Office Desk', code: 'ASSET-002' },
        { name: 'HP Printer', code: 'ASSET-003' },
    ];

    for (const item of items) {
        await prisma.inventoryItem.upsert({
            where: { code: item.code },
            update: {},
            create: {
                code: item.code,
                name: item.name,
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
            where: { code: `QR-${String(i).padStart(5, '0')}` },
            update: {},
            create: {
                code: `QR-${String(i).padStart(5, '0')}`,
                status: QRTagStatus.UNASSIGNED,
                batchId: 'BATCH-001',
            },
        });
    }
    console.log(`✅ Created 5 sample QR tags (unassigned)`);

    console.log('\n🎉 Database seed completed successfully!');
    console.log('\n📝 Test credentials:');
    console.log('   Admin: admin@assetsally.com / admin123');
    console.log('   Client: client@demo.com / admin123');
    console.log('   Auditor: auditor@demo.com / admin123');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
