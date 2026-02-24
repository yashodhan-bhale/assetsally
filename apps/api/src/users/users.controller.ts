import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

import { UsersService } from "./users.service";

@ApiTags("Users")
@Controller("users")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: "Get all users" })
  async findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @ApiOperation({ summary: "Create a new user" })
  async create(@Body() createUserDto: any) {
    return this.usersService.create(createUserDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by ID" })
  async findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a user" })
  async remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }
}
