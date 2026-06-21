"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const navItems = [
  { name: "Dashboard",    path: "/admin",           icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { name: "Orders",       path: "/admin/orders",    icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
  { name: "Products",     path: "/admin/products",  icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
  { name: "Customers",    path: "/admin/customers", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
  { name: "Hero Slides",  path: "/admin/hero",      icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { name: "Special Deals", path: "/admin/deals",   icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" },
  { name: "Settings",     path: "/admin/settings",  icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [adminEmail, setAdminEmail] = useState("bfc@admin.com");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    const auth = localStorage.getItem("bfc_admin_auth");
    const email = localStorage.getItem("bfc_admin_email") ?? localStorage.getItem("bfc_admin_email_active") ?? "bfc@admin.com";
    setAdminEmail(email);
    if (!auth && !isLoginPage) {
      router.replace("/admin/login");
    } else {
      setIsAuthenticated(!!auth);
    }
    setChecking(false);
  }, [isLoginPage, router]);

  const handleLogout = () => {
    localStorage.removeItem("bfc_admin_auth");
    localStorage.removeItem("bfc_admin_email_active");
    router.push("/admin/login");
  };

  // Login page — render with no shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Auth check loading screen
  if (checking) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zinc-800 border-t-red-600 rounded-full animate-spin" />
          <p className="text-zinc-600 text-sm font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  // Redirect in progress
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zinc-800 border-t-red-600 rounded-full animate-spin" />
          <p className="text-zinc-600 text-sm font-medium">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const initials = adminEmail.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 flex text-gray-900">

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-zinc-900 text-white z-50 flex flex-col transform transition-transform duration-300 ease-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>

        {/* Sidebar header */}
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="bg-red-600 text-white px-2.5 py-1 rounded-lg font-black text-lg tracking-tighter shadow-md shadow-red-600/20">BFC</div>
            <div className="flex flex-col leading-none">
              <span className="text-white font-black text-xs uppercase tracking-widest">Admin</span>
              <span className="text-zinc-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5">Panel</span>
            </div>
          </div>
          <button className="md:hidden text-zinc-500 hover:text-white p-1 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = pathname === item.path || (item.path !== "/admin" && pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group ${isActive ? "bg-red-600 text-white shadow-lg shadow-red-600/20" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}
              >
                <svg className={`w-4.5 h-4.5 shrink-0 transition-transform ${isActive ? "scale-110" : "group-hover:scale-105"}`} style={{ width: "18px", height: "18px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 2.5 : 2} d={item.icon} />
                </svg>
                {item.name}
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer: admin info + logout */}
        <div className="p-4 border-t border-zinc-800/80 shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-zinc-800/60 transition-colors cursor-default">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-xs shrink-0 border-2 border-red-500/30">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-xs truncate">Administrator</p>
              <p className="text-zinc-500 text-[10px] truncate">{adminEmail}</p>
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="text-zinc-600 hover:text-red-500 transition-colors p-1 shrink-0"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50">

        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-4 md:px-8 shrink-0 sticky top-0 z-30 shadow-sm shadow-black/[0.02]">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            {/* Breadcrumb */}
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
              <span className="font-semibold">Admin</span>
              <span>/</span>
              <span className="font-bold text-gray-900 capitalize">
                {pathname === "/admin" ? "Dashboard" : pathname.split("/admin/")[1]?.split("/")[0] ?? ""}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/" target="_blank" className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors bg-gray-50 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-red-100">
              View User Panel
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </Link>

            {/* Admin avatar + logout */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-gray-700 leading-tight">Administrator</p>
                <p className="text-[10px] text-gray-400">{adminEmail}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-zinc-900 border-2 border-red-600/40 flex items-center justify-center text-white font-black text-xs shrink-0">
                {initials}
              </div>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Logout"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Logout confirmation modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-7 shadow-2xl max-w-sm w-full text-center">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </div>
            <h3 className="font-black text-gray-900 text-lg mb-1">Sign Out?</h3>
            <p className="text-gray-500 text-sm mb-6">You will be redirected to the login screen.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors active:scale-95">Cancel</button>
              <button onClick={handleLogout} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-colors active:scale-95">Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
