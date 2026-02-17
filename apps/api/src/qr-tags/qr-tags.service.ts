import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QRTagStatus } from '@prisma/client';

@Injectable()
export class QrTagsService {
    constructor(private prisma: PrismaService) { }

    async findAll(query?: { status?: string; batchId?: string; page?: number; limit?: number }) {
        const page = query?.page || 1;
        const limit = query?.limit || 50;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (query?.status) where.status = query.status;
        if (query?.batchId) where.batchId = query.batchId;

        const [tags, total] = await Promise.all([
            this.prisma.qRCodeTag.findMany({
                where,
                include: {
                    linkedItem: { select: { id: true, code: true, name: true } },
                },
                skip,
                take: limit,
                orderBy: { code: 'asc' },
            }),
            this.prisma.qRCodeTag.count({ where }),
        ]);

        return {
            tags,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }

    async findByCode(code: string) {
        const tag = await this.prisma.qRCodeTag.findUnique({
            where: { code },
            include: {
                linkedItem: {
                    include: {
                        location: true,
                        department: true,
                        category: true,
                    },
                },
            },
        });

        if (!tag) {
            throw new NotFoundException(`QR tag ${code} not found`);
        }

        return tag;
    }

    async generateBatch(count: number, prefix: string = 'QR') {
        // Find the highest existing QR code number
        const lastTag = await this.prisma.qRCodeTag.findFirst({
            where: { code: { startsWith: prefix } },
            orderBy: { code: 'desc' },
        });

        let startNum = 1;
        if (lastTag) {
            const match = lastTag.code.match(/(\d+)$/);
            if (match) startNum = parseInt(match[1]) + 1;
        }

        const batchId = `BATCH-${Date.now()}`;
        const tags = [];

        for (let i = 0; i < count; i++) {
            const code = `${prefix}-${String(startNum + i).padStart(5, '0')}`;
            tags.push({
                code,
                status: QRTagStatus.UNASSIGNED,
                batchId,
            });
        }

        await this.prisma.qRCodeTag.createMany({ data: tags });

        return {
            batchId,
            count,
            codes: tags.map((t) => t.code),
        };
    }

    async assignToItem(tagCode: string, itemId: string) {
        const tag = await this.prisma.qRCodeTag.findUnique({ where: { code: tagCode } });
        if (!tag) throw new NotFoundException('QR tag not found');
        if (tag.status !== QRTagStatus.UNASSIGNED) throw new BadRequestException('Tag is already assigned');

        // Check if item already has a tag
        const existingTag = await this.prisma.qRCodeTag.findFirst({
            where: { linkedItemId: itemId, status: QRTagStatus.ASSIGNED },
        });
        if (existingTag) throw new BadRequestException('Item already has an assigned QR tag');

        return this.prisma.qRCodeTag.update({
            where: { code: tagCode },
            data: {
                linkedItemId: itemId,
                status: QRTagStatus.ASSIGNED,
            },
            include: {
                linkedItem: { select: { id: true, code: true, name: true } },
            },
        });
    }

    async retire(tagCode: string) {
        const tag = await this.prisma.qRCodeTag.findUnique({ where: { code: tagCode } });
        if (!tag) throw new NotFoundException('QR tag not found');

        return this.prisma.qRCodeTag.update({
            where: { code: tagCode },
            data: {
                status: QRTagStatus.RETIRED,
                linkedItemId: null,
                retiredAt: new Date(),
            },
        });
    }
}
