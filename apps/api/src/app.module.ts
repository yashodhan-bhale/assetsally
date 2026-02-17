import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { LocationsModule } from './locations/locations.module';
import { InventoryModule } from './inventory/inventory.module';
import { AuditsModule } from './audits/audits.module';
import { QrTagsModule } from './qr-tags/qr-tags.module';
import { ImportsModule } from './imports/imports.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env.local', '.env'],
        }),
        PrismaModule,
        HealthModule,
        AuthModule,
        LocationsModule,
        InventoryModule,
        AuditsModule,
        QrTagsModule,
        ImportsModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
