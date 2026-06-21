"use client";

import { useState, useEffect } from "react";

type Section = "general" | "hours" | "social" | "notifications" | "admin";

const DEFAULT_EMAIL = "bfc@admin.com";
const DEFAULT_PASSWORD = "adminpass1234";

const tabs: { id: Section; label: string; icon: string }[] = [
  { id: "general",       label: "General",       icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
  { id: "hours",         label: "Hours",         icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  { id: "social",        label: "Social Media",  icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" },
  { id: "notifications", label: "Notifications", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
  { id: "admin",         label: "Admin Account", icon: "M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
];

type Toast = { msg: string; type: "success" | "error" } | null;

function useToast() {
  const [toast, setToast] = useState<Toast>(null);
  const show = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };
  return { toast, show };
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<Section>("general");
  const [saved, setSaved] = useState(false);
  const { toast, show: showToast } = useToast();

  // ── General ──────────────────────────────────────────────
  const [general, setGeneral] = useState({
    restaurantName: "BFC Restaurant & Cafe",
    tagline: "The best fried chicken in Sihanoukville",
    address: "Main Road, Sihanoukville, Cambodia",
    phone: "+855 123 456 789",
    email: "hello@bfcrestaurant.com",
    currency: "USD",
    deliveryFee: "2.00",
    minOrder: "5.00",
  });

  const [hours] = useState([
    { day: "Monday",    open: "00:00", close: "23:59" },
    { day: "Tuesday",   open: "00:00", close: "23:59" },
    { day: "Wednesday", open: "00:00", close: "23:59" },
    { day: "Thursday",  open: "00:00", close: "23:59" },
    { day: "Friday",    open: "00:00", close: "23:59" },
    { day: "Saturday",  open: "00:00", close: "23:59" },
    { day: "Sunday",    open: "00:00", close: "23:59" },
  ]);

  const [social, setSocial] = useState({
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    telegram: "https://t.me/bfcrestaurant",
    twitter: "https://x.com",
  });

  const [notifs, setNotifs] = useState({
    newOrder: true,
    orderReady: true,
    lowStock: false,
    dailySummary: true,
  });

  // ── Admin Account ─────────────────────────────────────────
  const [currentEmail, setCurrentEmail] = useState(DEFAULT_EMAIL);
  const [newEmail, setNewEmail] = useState("");
  const [emailConfirmPass, setEmailConfirmPass] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);

  const [currPass, setCurrPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passSaving, setPassSaving] = useState(false);
  const [showCurr, setShowCurr] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const e = localStorage.getItem("bfc_admin_email") ?? DEFAULT_EMAIL;
    setCurrentEmail(e);
    setNewEmail(e);
  }, []);

  const handleChangeEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newEmail.includes("@")) { showToast("Please enter a valid email address.", "error"); return; }
    setEmailSaving(true);
    await new Promise(r => setTimeout(r, 600));
    const storedPassword = localStorage.getItem("bfc_admin_password") ?? DEFAULT_PASSWORD;
    if (emailConfirmPass !== storedPassword) { showToast("Current password is incorrect.", "error"); setEmailSaving(false); return; }
    localStorage.setItem("bfc_admin_email", newEmail);
    localStorage.setItem("bfc_admin_email_active", newEmail);
    setCurrentEmail(newEmail);
    setEmailConfirmPass("");
    showToast("Email updated successfully! Please re-login to reflect changes.");
    setEmailSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPass.length < 8) { showToast("New password must be at least 8 characters.", "error"); return; }
    if (newPass !== confirmPass) { showToast("New passwords do not match.", "error"); return; }
    setPassSaving(true);
    await new Promise(r => setTimeout(r, 600));
    const storedPassword = localStorage.getItem("bfc_admin_password") ?? DEFAULT_PASSWORD;
    if (currPass !== storedPassword) { showToast("Current password is incorrect.", "error"); setPassSaving(false); return; }
    localStorage.setItem("bfc_admin_password", newPass);
    setCurrPass(""); setNewPass(""); setConfirmPass("");
    showToast("Password changed successfully!");
    setPassSaving(false);
  };

  const handleResetToDefault = () => {
    if (!confirm("Reset credentials to default? (bfc@admin.com / adminpass1234)")) return;
    localStorage.setItem("bfc_admin_email", DEFAULT_EMAIL);
    localStorage.setItem("bfc_admin_email_active", DEFAULT_EMAIL);
    localStorage.setItem("bfc_admin_password", DEFAULT_PASSWORD);
    setCurrentEmail(DEFAULT_EMAIL);
    setNewEmail(DEFAULT_EMAIL);
    showToast("Credentials reset to default.");
  };

  const handleSave = () => {
    setSaved(true);
    showToast("Settings saved successfully!");
    setTimeout(() => setSaved(false), 2500);
  };

  const EyeIcon = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
    <button type="button" onClick={toggle} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1">
      {show ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
      )}
    </button>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your restaurant configuration and admin credentials.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="lg:w-52 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 flex lg:flex-col gap-1 overflow-x-auto hide-scrollbar">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all text-left whitespace-nowrap ${activeTab === tab.id ? "bg-zinc-900 text-white" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}>
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} /></svg>
                {tab.label}
                {tab.id === "admin" && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Content panel */}
        <div className="flex-1 min-w-0">

          {/* ── GENERAL ── */}
          {activeTab === "general" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-7 py-5 border-b border-gray-100">
                <h2 className="font-black text-gray-900 uppercase tracking-tight text-sm">General Information</h2>
                <p className="text-gray-400 text-xs mt-0.5">Basic restaurant details shown to customers.</p>
              </div>
              <div className="p-7 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Restaurant Name</label>
                    <input type="text" value={general.restaurantName} onChange={e => setGeneral(g => ({ ...g, restaurantName: e.target.value }))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Tagline</label>
                    <input type="text" value={general.tagline} onChange={e => setGeneral(g => ({ ...g, tagline: e.target.value }))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Address</label>
                    <input type="text" value={general.address} onChange={e => setGeneral(g => ({ ...g, address: e.target.value }))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Phone</label>
                    <input type="tel" value={general.phone} onChange={e => setGeneral(g => ({ ...g, phone: e.target.value }))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Email</label>
                    <input type="email" value={general.email} onChange={e => setGeneral(g => ({ ...g, email: e.target.value }))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all" />
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">Ordering Settings</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Currency</label>
                      <select value={general.currency} onChange={e => setGeneral(g => ({ ...g, currency: e.target.value }))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 transition-all">
                        <option>USD</option><option>KHR</option><option>EUR</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Delivery Fee ($)</label>
                      <input type="number" step="0.50" value={general.deliveryFee} onChange={e => setGeneral(g => ({ ...g, deliveryFee: e.target.value }))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Min. Order ($)</label>
                      <input type="number" step="0.50" value={general.minOrder} onChange={e => setGeneral(g => ({ ...g, minOrder: e.target.value }))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 transition-all" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-7 py-5 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400">Changes are applied immediately.</p>
                <button onClick={handleSave} className={`flex items-center gap-2 px-6 py-2.5 font-bold text-sm rounded-xl transition-all active:scale-95 ${saved ? "bg-green-600 text-white" : "bg-zinc-900 hover:bg-zinc-800 text-white"}`}>
                  {saved ? <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>Saved!</> : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* ── HOURS ── */}
          {activeTab === "hours" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-7 py-5 border-b border-gray-100">
                <h2 className="font-black text-gray-900 uppercase tracking-tight text-sm">Opening Hours</h2>
                <p className="text-gray-400 text-xs mt-0.5">BFC is open 24 hours, every day of the week.</p>
              </div>
              <div className="p-7 space-y-3">
                <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-5">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                  <p className="text-green-700 font-bold text-sm">BFC is currently open 24 hours, 7 days a week.</p>
                </div>
                {hours.map(h => (
                  <div key={h.day} className="flex items-center gap-4 bg-gray-50 rounded-xl px-4 py-3">
                    <span className="w-24 font-bold text-sm text-gray-700 shrink-0">{h.day}</span>
                    <span className="flex-1 text-sm text-gray-600 font-medium">{h.open} – {h.close}</span>
                    <span className="text-[10px] font-black text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-lg uppercase">Open</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SOCIAL ── */}
          {activeTab === "social" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-7 py-5 border-b border-gray-100">
                <h2 className="font-black text-gray-900 uppercase tracking-tight text-sm">Social Media Links</h2>
                <p className="text-gray-400 text-xs mt-0.5">These links appear in the website footer and contact page.</p>
              </div>
              <div className="p-7 space-y-4">
                {([
                  { key: "facebook",  label: "Facebook",    placeholder: "https://facebook.com/yourpage",    color: "bg-blue-600" },
                  { key: "instagram", label: "Instagram",   placeholder: "https://instagram.com/yourhandle", color: "bg-pink-600" },
                  { key: "telegram",  label: "Telegram",    placeholder: "https://t.me/yourchannel",         color: "bg-sky-500" },
                  { key: "twitter",   label: "X / Twitter", placeholder: "https://x.com/yourhandle",         color: "bg-zinc-900" },
                ] as const).map(s => (
                  <div key={s.key}>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-1.5">
                      <span className={`w-4 h-4 ${s.color} rounded flex items-center justify-center text-[8px] text-white font-black`}>{s.label[0]}</span>
                      {s.label}
                    </label>
                    <input type="url" value={social[s.key as keyof typeof social]} onChange={e => setSocial(v => ({ ...v, [s.key]: e.target.value }))} placeholder={s.placeholder} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all" />
                  </div>
                ))}
              </div>
              <div className="px-7 py-5 border-t border-gray-100 flex justify-end">
                <button onClick={handleSave} className={`flex items-center gap-2 px-6 py-2.5 font-bold text-sm rounded-xl transition-all active:scale-95 ${saved ? "bg-green-600 text-white" : "bg-zinc-900 hover:bg-zinc-800 text-white"}`}>
                  {saved ? <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>Saved!</> : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeTab === "notifications" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-7 py-5 border-b border-gray-100">
                <h2 className="font-black text-gray-900 uppercase tracking-tight text-sm">Notification Preferences</h2>
                <p className="text-gray-400 text-xs mt-0.5">Choose which events trigger admin notifications.</p>
              </div>
              <div className="p-7 space-y-3">
                {([
                  { key: "newOrder",     label: "New Order Received",  desc: "Get notified when a new order comes in." },
                  { key: "orderReady",   label: "Order Ready to Pick", desc: "Alert when an order is ready for pickup." },
                  { key: "lowStock",     label: "Low Stock Warning",   desc: "Notify when a product is running low." },
                  { key: "dailySummary", label: "Daily Summary Email", desc: "Receive a daily digest of sales and orders." },
                ] as const).map(n => (
                  <div key={n.key} className="flex items-center justify-between bg-gray-50 rounded-xl px-5 py-4">
                    <div>
                      <p className="font-bold text-sm text-gray-900">{n.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.desc}</p>
                    </div>
                    <button onClick={() => setNotifs(v => ({ ...v, [n.key]: !v[n.key] }))} className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${notifs[n.key] ? "bg-red-600" : "bg-gray-200"}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${notifs[n.key] ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="px-7 py-5 border-t border-gray-100 flex justify-end">
                <button onClick={handleSave} className={`flex items-center gap-2 px-6 py-2.5 font-bold text-sm rounded-xl transition-all active:scale-95 ${saved ? "bg-green-600 text-white" : "bg-zinc-900 hover:bg-zinc-800 text-white"}`}>
                  {saved ? <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>Saved!</> : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* ── ADMIN ACCOUNT ── */}
          {activeTab === "admin" && (
            <div className="space-y-5">

              {/* Current account info card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-7 py-5 border-b border-gray-100">
                  <h2 className="font-black text-gray-900 uppercase tracking-tight text-sm">Admin Account</h2>
                  <p className="text-gray-400 text-xs mt-0.5">Manage your admin login credentials.</p>
                </div>
                <div className="p-7">
                  <div className="flex items-center gap-5 p-5 bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-2xl">
                    <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-red-600/30 shrink-0">
                      {currentEmail.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-black text-base">BFC Administrator</p>
                      <p className="text-zinc-400 text-sm mt-0.5">{currentEmail}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-green-400 text-xs font-bold">Active Session</span>
                      </div>
                    </div>
                    <div className="ml-auto">
                      <span className="text-[10px] font-black uppercase text-zinc-500 bg-zinc-700/60 px-3 py-1.5 rounded-lg">Super Admin</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Change Email */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-7 py-5 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <h2 className="font-black text-gray-900 uppercase tracking-tight text-sm">Change Email Address</h2>
                    <p className="text-gray-400 text-xs mt-0.5">Update your admin login email.</p>
                  </div>
                </div>
                <form onSubmit={handleChangeEmail} className="p-7 space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">New Email Address</label>
                    <input required type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="new@email.com" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Confirm with Current Password</label>
                    <div className="relative">
                      <input required type={showCurr ? "text" : "password"} value={emailConfirmPass} onChange={e => setEmailConfirmPass(e.target.value)} placeholder="Enter current password to confirm" className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition-all" />
                      <EyeIcon show={showCurr} toggle={() => setShowCurr(v => !v)} />
                    </div>
                  </div>
                  <button type="submit" disabled={emailSaving} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-colors active:scale-95 flex items-center gap-2">
                    {emailSaving ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Updating...</> : "Update Email"}
                  </button>
                </form>
              </div>

              {/* Change Password */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-7 py-5 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <div>
                    <h2 className="font-black text-gray-900 uppercase tracking-tight text-sm">Change Password</h2>
                    <p className="text-gray-400 text-xs mt-0.5">Use a strong password with at least 8 characters.</p>
                  </div>
                </div>
                <form onSubmit={handleChangePassword} className="p-7 space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Current Password</label>
                    <div className="relative">
                      <input required type={showCurr ? "text" : "password"} value={currPass} onChange={e => setCurrPass(e.target.value)} placeholder="Enter current password" className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all" />
                      <EyeIcon show={showCurr} toggle={() => setShowCurr(v => !v)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">New Password</label>
                      <div className="relative">
                        <input required minLength={8} type={showNew ? "text" : "password"} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Min. 8 characters" className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all" />
                        <EyeIcon show={showNew} toggle={() => setShowNew(v => !v)} />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Confirm New Password</label>
                      <div className="relative">
                        <input required type={showConfirm ? "text" : "password"} value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Repeat new password" className={`w-full px-4 py-3 pr-12 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${confirmPass && confirmPass !== newPass ? "border-red-400 focus:ring-red-400/10 focus:border-red-400" : "border-gray-200 focus:border-red-400 focus:ring-red-400/10"}`} />
                        <EyeIcon show={showConfirm} toggle={() => setShowConfirm(v => !v)} />
                      </div>
                      {confirmPass && confirmPass !== newPass && (
                        <p className="text-red-500 text-[10px] font-bold mt-1">Passwords do not match.</p>
                      )}
                    </div>
                  </div>

                  {/* Password strength */}
                  {newPass && (
                    <div>
                      <div className="flex gap-1 mb-1">
                        {[...Array(4)].map((_, i) => {
                          const strength = newPass.length >= 12 ? 4 : newPass.length >= 10 ? 3 : newPass.length >= 8 ? 2 : 1;
                          return <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < strength ? strength <= 1 ? "bg-red-500" : strength === 2 ? "bg-yellow-500" : strength === 3 ? "bg-blue-500" : "bg-green-500" : "bg-gray-200"}`} />;
                        })}
                      </div>
                      <p className="text-[10px] text-gray-400">{newPass.length < 8 ? "Too short" : newPass.length < 10 ? "Weak" : newPass.length < 12 ? "Good" : "Strong"}</p>
                    </div>
                  )}

                  <button type="submit" disabled={passSaving} className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-colors active:scale-95 flex items-center gap-2">
                    {passSaving ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Changing...</> : "Change Password"}
                  </button>
                </form>
              </div>

              {/* Danger zone */}
              <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
                <div className="px-7 py-5 border-b border-red-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <div>
                    <h2 className="font-black text-red-600 uppercase tracking-tight text-sm">Danger Zone</h2>
                    <p className="text-gray-400 text-xs mt-0.5">These actions are irreversible — proceed with caution.</p>
                  </div>
                </div>
                <div className="p-7 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Reset to Default Credentials</p>
                    <p className="text-gray-400 text-xs mt-0.5">Resets email to <code className="bg-gray-100 px-1 rounded text-[10px]">bfc@admin.com</code> and password to <code className="bg-gray-100 px-1 rounded text-[10px]">adminpass1234</code>.</p>
                  </div>
                  <button onClick={handleResetToDefault} className="ml-4 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200 transition-colors active:scale-95 whitespace-nowrap shrink-0">
                    Reset Credentials
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] animate-[toastIn_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)]">
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-white ${toast.type === "success" ? "bg-zinc-900 border-zinc-800" : "bg-red-900 border-red-800"}`} style={{ minWidth: "260px" }}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${toast.type === "success" ? "bg-green-500" : "bg-red-600"}`}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {toast.type === "success"
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                }
              </svg>
            </div>
            <p className="text-sm font-semibold">{toast.msg}</p>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `.hide-scrollbar::-webkit-scrollbar{display:none}.hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}@keyframes toastIn{from{transform:translate(-50%,20px);opacity:0}to{transform:translate(-50%,0);opacity:1}}` }} />
    </div>
  );
}
