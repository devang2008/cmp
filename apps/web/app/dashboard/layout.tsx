// ============================================================
// DASHBOARD LAYOUT — SHIELD dark sidebar + top bar + dynamic user
// ============================================================
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import NotificationBell from "@/components/NotificationBell";
import {
  Shield, Home, Search, FileText, ClipboardList, MessageSquare,
  BadgeCheck, Star, Handshake, Menu, X, LogOut, ChevronRight
} from "lucide-react";

const BUYER_NAV = [
  { label: "Dashboard", href: "/dashboard/buyer", icon: Home },
  { label: "Requirements", href: "/dashboard/buyer/requirements", icon: FileText },
  { label: "Post Requirement", href: "/dashboard/buyer/post-requirement", icon: ClipboardList },
  { label: "Marketplace", href: "/dashboard/buyer/marketplace", icon: Search },
  { label: "Deals", href: "/dashboard/buyer/deals", icon: Handshake },
  { label: "Messages", href: "/dashboard/buyer/messages", icon: MessageSquare },
];

const VENDOR_NAV = [
  { label: "Dashboard", href: "/dashboard/vendor", icon: Home },
  { label: "Opportunities", href: "/dashboard/vendor/opportunities", icon: Search },
  { label: "Proposals", href: "/dashboard/vendor/proposals", icon: ClipboardList },
  { label: "Certifications", href: "/dashboard/vendor/certifications", icon: BadgeCheck },
  { label: "Trust Score", href: "/dashboard/vendor/trust", icon: Star },
  { label: "Deals", href: "/dashboard/vendor/deals", icon: Handshake },
  { label: "Messages", href: "/dashboard/vendor/messages", icon: MessageSquare },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alias, setAlias] = useState("");
  const [role, setRole] = useState("");

  // Fetch the user's alias and role
  useEffect(() => {
    const supabase = createClient();
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("alias, role")
        .eq("id", user.id)
        .single();
      if (profile) {
        setAlias(profile.alias || "");
        setRole(profile.role || "");
      }
    };
    loadProfile();
  }, []);

  // Determine nav based on role (with pathname fallback while role loads)
  const isVendor = role ? role === "vendor" : pathname.startsWith("/dashboard/vendor");
  const navItems = isVendor ? VENDOR_NAV : BUYER_NAV;
  const roleLabel = isVendor ? "Vendor" : "Buyer";

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-200 lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center gap-2.5 px-5 border-b border-slate-800">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-wide">SHIELD</span>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto p-1 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role indicator */}
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50">
              <div className={`w-2 h-2 rounded-full ${isVendor ? 'bg-purple-400' : 'bg-cyan-400'}`} />
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{roleLabel} Dashboard</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== `/dashboard/${isVendor ? 'vendor' : 'buyer'}` && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400 -ml-[2px] pl-[14px]"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
                >
                  <item.icon className="w-4.5 h-4.5" />
                  {item.label}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />}
                </Link>
              );
            })}
          </nav>

          {/* User Card */}
          <div className="p-3 border-t border-slate-800">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800/30">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {alias ? alias.charAt(0).toUpperCase() + (alias.split("-")[1]?.charAt(0)?.toUpperCase() || "") : "??"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate font-mono">
                  {alias || "Loading..."}
                </div>
                <div className="text-xs text-slate-500">{roleLabel}</div>
              </div>
              <button onClick={handleLogout} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors" title="Sign out">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500">
            <span>{roleLabel}</span>
            <span>/</span>
            <span className="text-slate-300">
              {navItems.find((n) => pathname.startsWith(n.href) && n.href !== `/dashboard/${isVendor ? 'vendor' : 'buyer'}`)?.label || "Dashboard"}
            </span>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
