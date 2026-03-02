import { UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { UserStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { vi, describe, it, expect, beforeEach, afterEach, Mock } from "vitest";

import { PrismaService } from "../prisma/prisma.service";

import { AuthService } from "./auth.service";

vi.mock("bcrypt", () => ({
    compare: vi.fn(),
    hash: vi.fn(),
}));

describe("AuthService", () => {
    let service: AuthService;
    let prisma: PrismaService;
    let jwt: JwtService;

    const mockPrismaService = {
        user: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        refreshToken: {
            findUnique: vi.fn(),
            delete: vi.fn(),
            create: vi.fn(),
            deleteMany: vi.fn(),
        },
    };

    const mockJwtService = {
        sign: vi.fn().mockReturnValue("signed-token"),
    };

    const mockConfigService = {
        get: vi.fn().mockImplementation((key, def) => def || "1h"),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: JwtService, useValue: mockJwtService },
                { provide: ConfigService, useValue: mockConfigService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        prisma = module.get<PrismaService>(PrismaService);
        jwt = module.get<JwtService>(JwtService);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("login", () => {
        it("should return tokens and user if credentials are valid", async () => {
            const user = {
                id: "1",
                email: "test@example.com",
                passwordHash: "hash",
                status: UserStatus.ACTIVE,
                appType: "ADMIN",
                name: "Test",
                role: "AUDITOR",
            };
            mockPrismaService.user.findUnique.mockResolvedValue(user);
            (bcrypt.compare as Mock).mockResolvedValue(true);

            const result = await service.login({
                email: "test@example.com",
                password: "password",
                appType: "WEB",
            });

            expect(result.accessToken).toBe("signed-token");
            expect(result.user.email).toBe(user.email);
            expect(mockPrismaService.user.update).toHaveBeenCalled();
        });

        it("should throw UnauthorizedException for invalid email", async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            await expect(
                service.login({ email: "bad", password: "p", appType: "WEB" }),
            ).rejects.toThrow(UnauthorizedException);
        });

        it("should throw UnauthorizedException for invalid password", async () => {
            mockPrismaService.user.findUnique.mockResolvedValue({ id: "1", passwordHash: "h" });
            (bcrypt.compare as Mock).mockResolvedValue(false);

            await expect(
                service.login({ email: "e", password: "p", appType: "WEB" }),
            ).rejects.toThrow(UnauthorizedException);
        });

        it("should throw UnauthorizedException if account is inactive", async () => {
            mockPrismaService.user.findUnique.mockResolvedValue({
                id: "1",
                passwordHash: "h",
                status: UserStatus.INACTIVE,
            });
            (bcrypt.compare as Mock).mockResolvedValue(true);

            await expect(
                service.login({ email: "e", password: "p", appType: "WEB" }),
            ).rejects.toThrow(UnauthorizedException);
        });
    });
});
