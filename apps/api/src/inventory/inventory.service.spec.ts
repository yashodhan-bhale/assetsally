import { ConflictException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

import { PrismaService } from "../prisma/prisma.service";

import { InventoryService } from "./inventory.service";

describe("InventoryService", () => {
  let service: InventoryService;
  let prisma: PrismaService;

  const mockPrismaService = {
    inventoryItem: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      groupBy: vi.fn(),
    },
    location: { findMany: vi.fn(), create: vi.fn() },
    department: { findMany: vi.fn(), create: vi.fn() },
    assetCategory: { findMany: vi.fn(), create: vi.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return paginated items", async () => {
      const items = [{ id: "1", assetNumber: "AST001", assetName: "Test" }];
      mockPrismaService.inventoryItem.findMany.mockResolvedValue(items);
      mockPrismaService.inventoryItem.count.mockResolvedValue(1);

      const result = await service.findAll();

      expect(result.items).toEqual(items);
      expect(result.pagination.total).toBe(1);
      expect(mockPrismaService.inventoryItem.findMany).toHaveBeenCalled();
    });

    it("should apply filters correctly", async () => {
      mockPrismaService.inventoryItem.findMany.mockResolvedValue([]);
      mockPrismaService.inventoryItem.count.mockResolvedValue(0);

      await service.findAll({ locationId: "loc-1", search: "test" });

      expect(mockPrismaService.inventoryItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            locationId: "loc-1",
            OR: expect.arrayContaining([
              expect.objectContaining({ assetName: { contains: "test", mode: "insensitive" } })
            ])
          })
        })
      );
    });
  });

  describe("findOne", () => {
    it("should return item if found", async () => {
      const item = { id: "1", assetNumber: "AST001" };
      mockPrismaService.inventoryItem.findUnique.mockResolvedValue(item);

      const result = await service.findOne("1");
      expect(result).toEqual(item);
    });

    it("should throw NotFoundException if not found", async () => {
      mockPrismaService.inventoryItem.findUnique.mockResolvedValue(null);

      await expect(service.findOne("1")).rejects.toThrow(NotFoundException);
    });
  });

  describe("create", () => {
    it("should create item if it does not exist", async () => {
      mockPrismaService.inventoryItem.findUnique.mockResolvedValue(null);
      const dto = { assetNumber: "AST-NEW", assetName: "New Asset" };
      mockPrismaService.inventoryItem.create.mockResolvedValue({ id: "new-id", ...dto });

      const result = await service.create(dto as any);

      expect(result.assetNumber).toBe("AST-NEW");
      expect(mockPrismaService.inventoryItem.create).toHaveBeenCalled();
    });

    it("should throw ConflictException if item already exists", async () => {
      mockPrismaService.inventoryItem.findUnique.mockResolvedValue({ id: "1" });
      const dto = { assetNumber: "AST001", assetName: "Existing" };

      await expect(service.create(dto as any)).rejects.toThrow(ConflictException);
    });
  });
});
