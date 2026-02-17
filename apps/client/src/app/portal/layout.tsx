'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, LayoutDashboard, MapPin, Package, FileCheck, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';

const navItems = [
    { href: '/portal', label: 'Overview', icon: LayoutDashboard },
    { href: '/portal/assets', label: 'Assets', icon: Package },
    { href: '/portal/locations', label: 'Locations', icon: MapPin },
    { href: '/portal/reports', label: 'Reports', icon: FileCheck },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, isAuthenticated, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.push('/login');
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Top navbar */}
            <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                                <ShieldCheck className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-bold text-white">
                                Assets<span className="text-emerald-400">Ally</span>
                            </span>
                            <span className="text-xs bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-medium ml-1">Client</span>
                        </div>

                        {/* Nav links */}
                        <div className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                const Icon = item.icon;
                                return (
                                    <Link key={item.href} href={item.href}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                                            ${isActive
                                                ? 'bg-emerald-500/15 text-emerald-400'
                                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* User */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                <User className="w-3.5 h-3.5 text-slate-500" />
                                <span className="text-xs text-slate-300">{user?.name}</span>
                            </div>
                            <button onClick={logout} className="p-2 text-slate-400 hover:text-red-400 transition-colors" title="Sign out">
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile nav */}
                <div className="md:hidden border-t border-slate-800/50 px-4 py-2 flex gap-1 overflow-x-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link key={item.href} href={item.href}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap
                                    ${isActive ? 'bg-emerald-500/15 text-emerald-400' : 'text-slate-500'}`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </main>
        </div>
    );
}
