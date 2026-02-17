/**
 * JWT Payload interface for authentication
 */
export interface JwtPayload {
    sub: string; // User ID
    email: string;
    appType: string;
    role: string;
    iat?: number;
    exp?: number;
}

/**
 * Login request DTO
 */
export interface LoginRequest {
    email: string;
    password: string;
    appType: 'ADMIN' | 'CLIENT' | 'MOBILE';
}

/**
 * Auth response with tokens
 */
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
        appType: string;
    };
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
    refreshToken: string;
}
