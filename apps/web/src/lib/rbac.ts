export enum UserRole {
  ADMIN = "ADMIN",
  CLIENT = "CLIENT",
  AUDITOR = "MOBILE", // Matching Prisma enum if possible, or mapping
}

export type Role = UserRole;

export const PERMISSIONS = {
  // Inventory
  INVENTORY_VIEW: [UserRole.ADMIN, UserRole.CLIENT],
  INVENTORY_CREATE: [UserRole.ADMIN],
  INVENTORY_EDIT: [UserRole.ADMIN],
  INVENTORY_DELETE: [UserRole.ADMIN],

  // Locations
  LOCATIONS_VIEW: [UserRole.ADMIN, UserRole.CLIENT],
  LOCATIONS_MANAGE: [UserRole.ADMIN],

  // Users
  USERS_MANAGE: [UserRole.ADMIN],

  // Reports
  REPORTS_VIEW: [UserRole.ADMIN, UserRole.CLIENT],
  REPORTS_MANAGE: [UserRole.ADMIN], // Approve/Reject

  // Settings
  SETTINGS_MANAGE: [UserRole.ADMIN],
};

export function hasRole(userRole: string, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(userRole as Role);
}

export function hasPermission(
  userRole: string,
  permissionRoles: Role[],
): boolean {
  return hasRole(userRole, permissionRoles);
}
