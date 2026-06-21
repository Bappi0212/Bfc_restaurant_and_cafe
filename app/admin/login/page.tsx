"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const DEFAULT_EMAIL = "bfc@admin.com";
const DEFAULT_PASSWORD = "adminpass1234";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem("bfc_admin_auth")) {
      router.replace("/admin");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise(r => setTimeout(r, 800));

    const storedEmail = localStorage.getItem("bfc_admin_email") ?? DEFAULT_EMAIL;
    const storedPassword = localStorage.getItem("bfc_admin_password") ?? DEFAULT_PASSWORD;

    if (email.trim().toLowerCase() === storedEmail.toLowerCase() && password === storedPassword) {
      localStorage.setItem("bfc_admin_auth", "true");
      localStorage.setItem("bfc_admin_email_active", storedEmail);
      router.push("/admin");
    } else {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex bg-zinc-950 overflow-hidden">

      {/* Left branded panel */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center animate-[kenburns_25s_linear_infinite]"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=1600&auto=format&fit=crop)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/95 via-zinc-950/80 to-red-950/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />

        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group w-max">
            <div className="bg-red-600 text-white px-3.5 py-2 rounded-xl font-black text-2xl tracking-tighter shadow-lg shadow-red-600/30 group-hover:shadow-red-600/50 transition-shadow">BFC</div>
            <div className="flex flex-col leading-none">
              <span className="text-white font-black text-sm uppercase tracking-widest">Restaurant</span>
              <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-0.5">& Cafe</span>
            </div>
          </Link>

          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center">
            <span className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-4 block">Admin Control Panel</span>
            <h1 className="text-5xl xl:text-6xl font-black text-white leading-[0.95] tracking-tight mb-6">
              Manage Your<br />
              <span className="text-red-500">Restaurant</span><br />
              with Ease
            </h1>
            <p className="text-zinc-400 text-base leading-relaxed max-w-sm mb-10">
              Access your full dashboard — orders, products, customers, and analytics — all in one place.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mb-12">
              {["Real-time Orders", "Product Management", "Customer Insights", "Sales Analytics"].map(f => (
                <span key={f} className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 bg-white/5 border border-white/10 px-3.5 py-2 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  {f}
                </span>
              ))}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              {[{ val: "50K+", label: "Orders" }, { val: "100%", label: "Fresh" }, { val: "24/7", label: "Support" }].map(s => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-sm">
                  <p className="text-2xl font-black text-red-500">{s.val}</p>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom link */}
          <div className="flex items-center justify-between">
            <p className="text-zinc-600 text-xs">© 2026 BFC Restaurant & Cafe</p>
            <Link href="/" className="text-zinc-500 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1">
              View Live Site
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </Link>
          </div>
        </div>

        {/* Floating decorative orbs */}
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-1/4 -left-10 w-60 h-60 bg-red-600/5 rounded-full blur-2xl animate-[float_6s_ease-in-out_infinite_reverse]" />
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 relative">

        {/* Mobile logo */}
        <div className="lg:hidden mb-10 text-center">
          <div className="inline-flex items-center gap-2.5">
            <div className="bg-red-600 text-white px-3 py-1.5 rounded-xl font-black text-xl tracking-tighter shadow-lg shadow-red-600/30">BFC</div>
            <span className="text-white font-black text-base uppercase tracking-widest">Admin</span>
          </div>
          <p className="text-zinc-500 text-sm mt-2">Restaurant Management System</p>
        </div>

        {/* Login card */}
        <div className="w-full max-w-md">
          {/* Glass card */}
          <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-black text-white tracking-tight">Welcome Back</h2>
              <p className="text-zinc-500 text-sm mt-1">Sign in to your admin account</p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-5 flex items-start gap-3 bg-red-600/10 border border-red-600/20 rounded-xl px-4 py-3.5">
                <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email field */}
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Email Address</label>
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <input
                    required
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(""); }}
                    className="w-full bg-zinc-800/60 border border-white/10 text-white placeholder-zinc-600 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10 transition-all"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Password</label>
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(""); }}
                    className="w-full bg-zinc-800/60 border border-white/10 text-white placeholder-zinc-600 rounded-xl pl-11 pr-12 py-3.5 text-sm focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors p-1"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-red-600 hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-sm rounded-xl shadow-lg shadow-red-600/25 hover:shadow-red-600/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all uppercase tracking-widest flex items-center justify-center gap-2.5"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Verifying...
                  </>
                ) : (
                  <>
                    Sign In to Dashboard
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                  </>
                )}
              </button>
            </form>

          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-zinc-600 hover:text-zinc-400 text-xs font-medium transition-colors inline-flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to BFC Website
            </Link>
          </div>
        </div>

        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/3 rounded-full blur-3xl" />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes kenburns { 0% { transform: scale(1); } 100% { transform: scale(1.08); } }
          @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        `
      }} />
    </div>
  );
}
