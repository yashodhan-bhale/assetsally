import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AuditScheduleModule } from "./audit-schedule/audit-schedule.module";
import { AuditsModule } from "./audits/audits.module";
import { AuthModule } from "./auth/auth.module";
import { HealthModule } from "./health/health.module";
import { ImportsModule } from "./imports/imports.module";
import { InventoryModule } from "./inventory/inventory.module";
import { LocationsModule } from "./locations/locations.module";
import { PrismaModule } from "./prisma/prisma.module";
import { QrTagsModule } from "./qr-tags/qr-tags.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    LocationsModule,
    InventoryModule,
    AuditsModule,
    QrTagsModule,
    ImportsModule,
    UsersModule,
    AuditScheduleModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
