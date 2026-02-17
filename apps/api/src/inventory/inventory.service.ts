import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryItemDto, UpdateInventoryItemDto } from './dto';
import * as XLSX from 'xlsx';

@Injectable()
export class InventoryService {
    constructor(private prisma: PrismaService) { }

    async findAll(query?: {
        locationId?: string;
        departmentId?: string;
        categoryId?: string;
        search?: string;
        page?: number;
        limit?: number;
    }) {
        const page = query?.page || 1;
        const limit = query?.limit || 50;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (query?.locationId) where.locationId = query.locationId;
        if (query?.departmentId) where.departmentId = query.departmentId;
        if (query?.categoryId) where.categoryId = query.categoryId;
        if (query?.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { code: { contains: query.search, mode: 'insensitive' } },
            ];
        }

        const [items, total] = await Promise.all([
            this.prisma.inventoryItem.findMany({
                where,
                include: {
                    location: { select: { id: true, code: true, name: true, path: true } },
                    department: { select: { id: true, code: true, name: true } },
                    category: { select: { id: true, code: true, name: true } },
                    qrTag: { select: { id: true, code: true, status: true } },
                },
                skip,
                take: limit,
                orderBy: { code: 'asc' },
            }),
            this.prisma.inventoryItem.count({ where }),
        ]);

        return {
            items,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const item = await this.prisma.inventoryItem.findUnique({
            where: { id },
            include: {
                location: true,
                department: true,
                category: true,
                qrTag: true,
                auditFindings: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        report: { select: { id: true, status: true, createdAt: true } },
                    },
                },
            },
        });

        if (!item) throw new NotFoundException(`Inventory item ${id} not found`);
        return item;
    }

    async create(dto: CreateInventoryItemDto) {
        const existing = await this.prisma.inventoryItem.findUnique({ where: { code: dto.code } });
        if (existing) {
            throw new ConflictException(`Item with code ${dto.code} already exists`);
        }

        return this.prisma.inventoryItem.create({
            data: {
                code: dto.code,
                name: dto.name,
                description: dto.description,
                locationId: dto.locationId,
                departmentId: dto.departmentId,
                categoryId: dto.categoryId,
                customFields: dto.customFields || {},
                // New Fields
                purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : undefined,
                cost: dto.cost,
                bookValue: dto.bookValue,
                profitCenter: dto.profitCenter,
                subCategory: dto.subCategory,
                unitOfMeasure: dto.unitOfMeasure,
            },
            include: {
                location: { select: { id: true, code: true, name: true } },
                department: { select: { id: true, code: true, name: true } },
                category: { select: { id: true, code: true, name: true } },
            },
        });
    }

    async update(id: string, dto: UpdateInventoryItemDto) {
        await this.findOne(id);

        return this.prisma.inventoryItem.update({
            where: { id },
            data: {
                ...dto,
                purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : undefined,
            },
            include: {
                location: { select: { id: true, code: true, name: true } },
                department: { select: { id: true, code: true, name: true } },
                category: { select: { id: true, code: true, name: true } },
            },
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.inventoryItem.delete({ where: { id } });
    }

    async bulkImport(fileBuffer: Buffer, filename: string) {
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames.find(n => n.includes('Inventory')) || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json<any>(worksheet);

        const results = {
            processed: 0,
            created: 0,
            updated: 0,
            errors: [] as string[],
        };

        // Pre-fetch caches (optimization)
        const departments = await this.prisma.department.findMany();
        const deptMap = new Map(departments.map(d => [d.name.toLowerCase().trim(), d.id]));

        const categories = await this.prisma.assetCategory.findMany();
        const catMap = new Map(categories.map(c => [c.name.toLowerCase().trim(), c.id]));

        const locations = await this.prisma.location.findMany({ select: { id: true, code: true } });
        const locMap = new Map(locations.map(l => [l.code.toLowerCase().trim(), l.id]));

        for (const [index, row] of data.entries()) {
            const rowIndex = index + 2; // Excel row number (1-based, +1 for header)
            try {
                // Determine format based on headers
                const code = row['Asset Code'] || row['Asset Number'];
                const name = row['Asset Name'] || row['Name of the Assets'];
                const locCode = row['Location Code'] || row['Storage Location Code'];

                if (!code || !name || !locCode) {
                    continue;
                }

                results.processed++;

                // 1. Resolve Location
                const locationId = locMap.get(String(locCode).toLowerCase().trim());
                if (!locationId) {
                    results.errors.push(`Row ${rowIndex}: Location code '${locCode}' not found`);
                    continue;
                }

                // 2. Resolve Department
                let departmentId: string | null = null;
                const deptName = row['Department'];
                if (deptName) {
                    const normDept = String(deptName).toLowerCase().trim();
                    if (deptMap.has(normDept)) {
                        departmentId = deptMap.get(normDept)!;
                    } else {
                        const newDept = await this.prisma.department.create({
                            data: {
                                // Auto-gen code with random suffix to avoid collision
                                code: (deptName.substring(0, 6).toUpperCase().replace(/[^A-Z0-9]/g, '') + '-' + Math.random().toString(36).substring(2, 6).toUpperCase()).substring(0, 20),
                                name: deptName,
                            }
                        });
                        departmentId = newDept.id;
                        deptMap.set(normDept, newDept.id);
                    }
                }

                // 3. Resolve Category
                let categoryId: string | null = null;
                const catName = row['Category'] || row['Major Catogeory'];
                if (catName) {
                    const normCat = String(catName).toLowerCase().trim();
                    if (catMap.has(normCat)) {
                        categoryId = catMap.get(normCat)!;
                    } else {
                        const newCat = await this.prisma.assetCategory.create({
                            data: {
                                // Auto-gen code with random suffix to avoid collision
                                code: (catName.substring(0, 6).toUpperCase().replace(/[^A-Z0-9]/g, '') + '-' + Math.random().toString(36).substring(2, 6).toUpperCase()).substring(0, 20),
                                name: catName,
                            }
                        });
                        categoryId = newCat.id;
                        catMap.set(normCat, newCat.id);
                    }
                }

                // 4. Map Dates & Financials
                const dateRaw = row['Date of Put to use of asset'] || row['Purchase Date'];
                let purchaseDate: Date | undefined;
                if (typeof dateRaw === 'number') {
                    purchaseDate = new Date(Math.round((dateRaw - 25569) * 86400 * 1000));
                } else if (dateRaw) {
                    purchaseDate = new Date(dateRaw);
                }

                const cost = parseFloat(row['Cost of Asset'] || row['Cost'] || '0') || undefined;
                const bookValue = parseFloat(row['Book Value'] || '0') || undefined;
                const profitCenter = row['Profit Center'] ? String(row['Profit Center']) : undefined;
                const subCategory = row['Minor Catogeory'] || row['Sub Category'];
                const uom = row['A'] || row['Unit of Measure'];
                const description = row['Description'] || row['Descrption of Asset'];

                // 5. Upsert Item
                const itemData = {
                    code: String(code),
                    name: String(name),
                    description: description,
                    locationId,
                    departmentId,
                    categoryId,
                    cost,
                    bookValue,
                    purchaseDate,
                    profitCenter,
                    subCategory,
                    unitOfMeasure: uom,
                    customFields: {},
                };

                const existingItem = await this.prisma.inventoryItem.findUnique({ where: { code: String(code) } });

                if (existingItem) {
                    await this.prisma.inventoryItem.update({
                        where: { id: existingItem.id },
                        data: itemData,
                    });
                    results.updated++;
                } else {
                    await this.prisma.inventoryItem.create({
                        data: itemData,
                    });
                    results.created++;
                }

            } catch (error: any) {
                results.errors.push(`Row ${rowIndex}: ${error.message}`);
            }
        }

        return results;
    }

    async getStats() {
        const [totalItems, itemsByLocation, itemsByCategory] = await Promise.all([
            this.prisma.inventoryItem.count(),
            this.prisma.inventoryItem.groupBy({
                by: ['locationId'],
                _count: true,
            }),
            this.prisma.inventoryItem.groupBy({
                by: ['categoryId'],
                _count: true,
            }),
        ]);

        return { totalItems, itemsByLocation, itemsByCategory };
    }
}
