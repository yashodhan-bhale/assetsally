import {
  LayoutDashboard,
  Calendar,
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
  icon: any;
  roles?: ("ADMIN" | "CLIENT")[];
  children?: NavItem[];
}

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "CLIENT"],
  },
  {
    title: "Audit Schedule",
    href: "/dashboard/audit-schedule/calendar",
    icon: Calendar,
    roles: ["ADMIN"],
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
    children: [
      {
        title: "Staff",
        href: "/dashboard/users/staff",
        icon: Users,
      },
      {
        title: "Auditors",
        href: "/dashboard/users/auditors",
        icon: Users,
      },
      {
        title: "Clients",
        href: "/dashboard/users/clients",
        icon: Users,
      },
    ],
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
