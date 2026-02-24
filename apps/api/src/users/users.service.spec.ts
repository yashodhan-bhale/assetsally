import { Test, TestingModule } from "@nestjs/testing";
import { ConflictException, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { vi, describe, it, expect, beforeEach, afterEach, Mock } from "vitest";
import { UsersService } from "./users.service";
import { PrismaService } from "../prisma/prisma.service";

// Mock bcrypt
vi.mock("bcrypt", () => ({
    hash: vi.fn(),
    compare: vi.fn(),
}));

describe("UsersService", () => {
    let service: UsersService;
    let prisma: PrismaService;

    const mockPrismaService = {
        user: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            delete: vi.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("findAll", () => {
        it("should return an array of users", async () => {
            const result = [
                { id: "1", email: "test@example.com", name: "Test User" },
            ] as any;
            mockPrismaService.user.findMany.mockResolvedValue(result);

            expect(await service.findAll()).toBe(result);
            expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
                select: {
                    id: true,
                    email: true,
                    name: true,
                    phone: true,
                    appType: true,
                    role: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: { createdAt: "desc" },
            });
        });
    });

    describe("create", () => {
        const createUserDto = {
            email: "new@example.com",
            password: "password123",
            name: "New User",
        };

        it("should hash password and create a new user", async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            (bcrypt.hash as Mock).mockResolvedValue("hashedPassword");
            mockPrismaService.user.create.mockResolvedValue({
                id: "1",
                ...createUserDto,
                passwordHash: "hashedPassword",
            });

            const result = await service.create(createUserDto);

            expect(result.id).toBe("1");
            expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
            expect(mockPrismaService.user.create).toHaveBeenCalled();
        });

        it("should throw ConflictException if user already exists", async () => {
            mockPrismaService.user.findUnique.mockResolvedValue({ id: "1" });

            await expect(service.create(createUserDto)).rejects.toThrow(
                ConflictException,
            );
        });
    });

    describe("findOne", () => {
        it("should return a user if found", async () => {
            const user = { id: "1", email: "test@example.com", passwordHash: "hash" };
            mockPrismaService.user.findUnique.mockResolvedValue(user);

            const result = await service.findOne("1");
            expect(result).toEqual({ id: "1", email: "test@example.com" });
        });

        it("should throw NotFoundException if user not found", async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            await expect(service.findOne("1")).rejects.toThrow(NotFoundException);
        });
    });

    describe("remove", () => {
        it("should delete a user", async () => {
            mockPrismaService.user.delete.mockResolvedValue({ id: "1" });

            const result = await service.remove("1");
            expect(result).toEqual({ id: "1" });
            expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
                where: { id: "1" },
            });
        });
    });
});
