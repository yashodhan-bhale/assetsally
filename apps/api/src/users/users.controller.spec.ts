import { Reflector } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

describe("UsersController", () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findAll: vi.fn(),
    create: vi.fn(),
    findOne: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtAuthGuard,
          useValue: { canActivate: () => true },
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return all users", async () => {
      const result = [{ id: "1", name: "Test User" }];
      mockUsersService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
      expect(mockUsersService.findAll).toHaveBeenCalled();
    });
  });

  describe("create", () => {
    it("should create a new user", async () => {
      const dto = { name: "New User", email: "test@example.com" };
      const result = { id: "1", ...dto };
      mockUsersService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toBe(result);
      expect(mockUsersService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe("findOne", () => {
    it("should return a single user", async () => {
      const result = { id: "1", name: "Test User" };
      mockUsersService.findOne.mockResolvedValue(result);

      expect(await controller.findOne("1")).toBe(result);
      expect(mockUsersService.findOne).toHaveBeenCalledWith("1");
    });
  });

  describe("remove", () => {
    it("should delete a user", async () => {
      const result = { id: "1" };
      mockUsersService.remove.mockResolvedValue(result);

      expect(await controller.remove("1")).toBe(result);
      expect(mockUsersService.remove).toHaveBeenCalledWith("1");
    });
  });
});
