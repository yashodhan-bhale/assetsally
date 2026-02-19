import {
  LayoutDashboard,
  Package,
  MapPin,
  Users,
  FileText,
  QrCode,
  Settings,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  roles?: ("ADMIN" | "CLIENT")[];
}

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "CLIENT"],
  },
  {
    title: "Inventory",
    href: "/dashboard/inventory",
    icon: Package,
    roles: ["ADMIN", "CLIENT"],
  },
  {
    title: "Locations",
    href: "/dashboard/locations",
    icon: MapPin,
    roles: ["ADMIN", "CLIENT"], // Client sees read-only or restricted view
  },
  {
    title: "User Management",
    href: "/dashboard/users",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: FileText,
    roles: ["ADMIN", "CLIENT"],
  },
  {
    title: "QR Generator",
    href: "/dashboard/qr-generator",
    icon: QrCode,
    roles: ["ADMIN"],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["ADMIN"],
  },
];
