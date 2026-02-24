"use client";

import { Button } from "@assetsally/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import {
  Loader2,
  Plus,
  UserPlus,
  Trash2,
  Mail,
  Shield,
  MapPin,
  MoreHorizontal,
  Phone,
  User as UserIcon,
  Filter,
} from "lucide-react";
import React, { useEffect, useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { DataTable } from "../../../components/ui/data-table";
import { api } from "../../../lib/api";

const LoaderIcon: any = Loader2;
const PlusIcon: any = Plus;
const UserPlusIcon: any = UserPlus;
const TrashIcon: any = Trash2;
const UserIconCompat: any = UserIcon;
const MailIcon: any = Mail;
const ShieldIcon: any = Shield;
const MapPinIcon: any = MapPin;
const MoreHorizontalIcon: any = MoreHorizontal;
const PhoneIcon: any = Phone;
const FilterIcon: any = Filter;

// Schema for user creation
const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  appType: z.enum(["ADMIN", "CLIENT", "MOBILE"]),
  role: z.string().min(1, "Role is required"),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

interface UserListItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  appType: string;
  role: string;
  status: string;
  assignedLocation?: {
    id: string;
    locationName: string;
  };
  createdAt: string;
}

function UsersContent() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      appType: "MOBILE",
      role: "AUDITOR",
    },
  });

  const selectedAppType = watch("appType");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = async (data: CreateUserFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await api.createUser(data);
      setShowAddForm(false);
      reset();
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.deleteUser(id);
      loadData();
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  const columns: ColumnDef<UserListItem>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <UserIconCompat className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium text-slate-900">
              {row.original.name}
            </div>
            <div className="text-xs text-slate-500">
              {row.original.id.split("-")[0]}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Contact",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <MailIcon className="w-3.5 h-3.5 text-slate-400" />
            {row.original.email}
          </div>
          {row.original.phone && (
            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
              <PhoneIcon className="w-3.5 h-3.5 text-slate-400" />
              {row.original.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "appType",
      header: "Platform",
      cell: ({ row }) => {
        const type = row.original.appType;
        let colors = "bg-slate-100 text-slate-700";
        if (type === "ADMIN") colors = "bg-purple-100 text-purple-700";
        if (type === "CLIENT") colors = "bg-blue-100 text-blue-700";
        if (type === "MOBILE") colors = "bg-emerald-100 text-emerald-700";

        return (
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors}`}
          >
            {type}
          </span>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.original.role;
        const appType = row.original.appType;
        let displayRole = role.toLowerCase().replace("_", " ");
        if (appType === "CLIENT") displayRole = "Client";

        return (
          <div className="flex items-center gap-1.5 text-slate-600 capitalize">
            <ShieldIcon className="w-3.5 h-3.5" />
            {displayRole}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            row.original.status === "ACTIVE"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const isOpen = activeMenu === row.original.id;
        return (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenu(isOpen ? null : row.original.id);
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <MoreHorizontalIcon className="w-5 h-5" />
            </button>
            {isOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setActiveMenu(null)}
                />
                <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg border border-slate-200 shadow-lg z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => {
                      setActiveMenu(null);
                      // Handle Edit
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setActiveMenu(null);
                      // Handle Details
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => {
                      setActiveMenu(null);
                      deleteUser(row.original.id);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const filteredUsers = users.filter((user) => {
    if (roleFilter === "ALL") return true;
    return user.role === roleFilter;
  });

  const availableRoles = Array.from(new Set(users.map((u) => u.role))).sort();

  if (loading && !users.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoaderIcon className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-slate-500">
            Manage system users, their access levels, and assigned locations.
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {showAddForm ? (
            "Cancel"
          ) : (
            <span className="flex items-center gap-2">
              <UserPlusIcon className="w-4 h-4" />
              Add User
            </span>
          )}
        </Button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-semibold mb-4 text-slate-900">
            Add New User
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <input
                  {...register("name")}
                  className={`w-full px-3 py-2 rounded-lg border ${errors.name ? "border-red-500" : "border-slate-200"} focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <input
                  {...register("email")}
                  className={`w-full px-3 py-2 rounded-lg border ${errors.email ? "border-red-500" : "border-slate-200"} focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  {...register("password")}
                  className={`w-full px-3 py-2 rounded-lg border ${errors.password ? "border-red-500" : "border-slate-200"} focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="******"
                />
                {errors.password && (
                  <p className="text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Platform Access
                </label>
                <select
                  {...register("appType")}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="CLIENT">CLIENT</option>
                  <option value="MOBILE">MOBILE (Auditor)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Role
                </label>
                <input
                  {...register("role")}
                  className={`w-full px-3 py-2 rounded-lg border ${errors.role ? "border-red-500" : "border-slate-200"} focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder={
                    selectedAppType === "ADMIN"
                      ? "SUPER_ADMIN"
                      : selectedAppType === "MOBILE"
                        ? "AUDITOR"
                        : "MANAGER"
                  }
                />
                {errors.role && (
                  <p className="text-xs text-red-500">{errors.role.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Phone Number
                </label>
                <input
                  {...register("phone")}
                  className={`w-full px-3 py-2 rounded-lg border ${errors.phone ? "border-red-500" : "border-slate-200"} focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="+91 98765 43210"
                />
                {errors.phone && (
                  <p className="text-xs text-red-500">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <LoaderIcon className="w-4 h-4 animate-spin" />
                ) : (
                  "Create User"
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        columns={columns}
        data={filteredUsers}
        placeholder="Search users by name or email..."
        filters={
          <div className="flex items-center gap-2">
            <div className="relative">
              <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-10 pl-9 pr-8 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none min-w-[140px]"
              >
                <option value="ALL">All Roles</option>
                {availableRoles.map((role) => (
                  <option key={role} value={role}>
                    {role.toLowerCase().replace("_", " ")}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="h-4 w-4 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="m19 9-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-96">
          <LoaderIcon className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <UsersContent />
    </Suspense>
  );
}
