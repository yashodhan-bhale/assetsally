
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Database Check ---');
    try {
        const userCount = await prisma.user.count();
        console.log(`Total users in DB: ${userCount}`);

        const users = await prisma.user.findMany({
            select: {
                email: true,
                appType: true,
                role: true,
                status: true,
                passwordHash: true,
            }
        });

        console.log('\nUser details:');
        for (const user of users) {
            console.log(`- ${user.email} (${user.appType}/${user.role}) [${user.status}]`);
            const isMatch = await bcrypt.compare('admin123', user.passwordHash);
            console.log(`  Password 'admin123' check: ${isMatch ? '✅ MATCH' : '❌ FAIL'}`);
        }

    } catch (error) {
        console.error('Error checking DB:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
