import { Module } from '@nestjs/common';
import { ImportsService } from './imports.service';
import { ImportsController } from './imports.controller';
import { DatabaseModule } from '@assetsally/database';

@Module({
    imports: [DatabaseModule],
    controllers: [ImportsController],
    providers: [ImportsService],
})
export class ImportsModule { }
