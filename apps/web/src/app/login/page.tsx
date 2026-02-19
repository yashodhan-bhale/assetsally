"use client";

import { ShieldCheck, Mail, Lock, AlertCircle, Loader2, User, Building } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "../../contexts/auth-context";

type LoginType = "ADMIN" | "CLIENT";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<LoginType>("ADMIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleTabChange = (tab: LoginType) => {
    setActiveTab(tab);
    setError("");
    setEmail(""); // Optional: clear fields on switch
    setPassword("");
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password, activeTab);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20 mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            Assets<span className="text-blue-400">Ally</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Asset Verification System</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-1 shadow-2xl overflow-hidden">

          {/* Tabs */}
          <div className="grid grid-cols-2 p-1 gap-1 bg-slate-800/50 rounded-xl mb-6">
            <button
              onClick={() => handleTabChange("ADMIN")}
              className={`relative flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === "ADMIN" ? "text-white" : "text-slate-400 hover:text-slate-200"
                }`}
            >
              {activeTab === "ADMIN" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-blue-600 rounded-lg shadow-lg"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <User className="w-4 h-4" />
                Admin Login
              </span>
            </button>
            <button
              onClick={() => handleTabChange("CLIENT")}
              className={`relative flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === "CLIENT" ? "text-white" : "text-slate-400 hover:text-slate-200"
                }`}
            >
              {activeTab === "CLIENT" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-indigo-600 rounded-lg shadow-lg"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Building className="w-4 h-4" />
                Client Login
              </span>
            </button>
          </div>

          <div className="px-7 pb-8 pt-2">
            <h2 className="text-xl font-semibold text-white mb-6 text-center">
              {activeTab === "ADMIN" ? "Welcome back, Admin" : "Client Portal Access"}
            </h2>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6 animate-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={activeTab === "ADMIN" ? "admin@assetsally.com" : "client@company.com"}
                    required
                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${activeTab === "ADMIN"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/25 hover:shadow-blue-500/40"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/25 hover:shadow-indigo-500/40"
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  `Login as ${activeTab === "ADMIN" ? "Admin" : "Client"}`
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          AssetsAlly v1.0.0 — Asset Verification System
        </p>
      </div>
    </main>
  );
}
