import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, IsIn } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "admin@assetsally.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "admin123" })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: "ADMIN", enum: ["ADMIN", "CLIENT", "MOBILE"] })
  @IsIn(["ADMIN", "CLIENT", "MOBILE"])
  appType: "ADMIN" | "CLIENT" | "MOBILE";
}

export class RefreshTokenDto {
  @ApiProperty({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  expiresIn: number;

  @ApiProperty()
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    appType: string;
  };
}
