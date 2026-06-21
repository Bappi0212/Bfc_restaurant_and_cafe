"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import Pagination from "./components/Pagination";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

type Order = {
  id: number;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  status: string;
  created_at: string;
};

type Filter = "today" | "week" | "month" | "all" | "custom";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "today",  label: "Today" },
  { value: "week",   label: "This Week" },
  { value: "month",  label: "This Month" },
  { value: "all",    label: "All Time" },
  { value: "custom", label: "Custom" },
];

const statusColors: Record<string, string> = {
  Pending:   "bg-yellow-50 text-yellow-700 border-yellow-200",
  Preparing: "bg-blue-50 text-blue-700 border-blue-200",
  Ready:     "bg-purple-50 text-purple-700 border-purple-200",
  Delivered: "bg-green-50 text-green-700 border-green-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
};

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getFilteredOrders(
  orders: Order[],
  filter: Filter,
  customStart: string,
  customEnd: string
): Order[] {
  const now = new Date();
  if (filter === "today") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return orders.filter(o => new Date(o.created_at) >= start);
  }
  if (filter === "week") {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return orders.filter(o => new Date(o.created_at) >= start);
  }
  if (filter === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return orders.filter(o => new Date(o.created_at) >= start);
  }
  if (filter === "custom" && customStart && customEnd) {
    const start = new Date(customStart + "T00:00:00");
    const end   = new Date(customEnd   + "T23:59:59");
    return orders.filter(o => {
      const d = new Date(o.created_at);
      return d >= start && d <= end;
    });
  }
  return orders;
}

function filterLabel(filter: Filter, customStart: string, customEnd: string): string {
  const now = new Date();
  if (filter === "today")
    return now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  if (filter === "week") {
    const start = new Date(now); start.setDate(now.getDate() - 6); start.setHours(0, 0, 0, 0);
    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  }
  if (filter === "month")
    return now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  if (filter === "custom" && customStart && customEnd) {
    const fmt = (s: string) => new Date(s + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return customStart === customEnd ? fmt(customStart) : `${fmt(customStart)} – ${fmt(customEnd)}`;
  }
  return "All Time";
}

export default function AdminDashboard() {
  const [allOrders, setAllOrders]         = useState<Order[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [dbConnected, setDbConnected]     = useState<boolean | null>(null);
  const [loading, setLoading]             = useState(true);
  const [filter, setFilter]               = useState<Filter>("all");
  const [customStart, setCustomStart]     = useState(todayStr());
  const [customEnd, setCustomEnd]         = useState(todayStr());
  const [customApplied, setCustomApplied] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [dashPage, setDashPage]           = useState(1);
  const [dashPageSize, setDashPageSize]   = useState(10);

  useEffect(() => {
    async function load() {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          supabase.from("orders").select("id, customer_name, customer_phone, total_amount, status, created_at").order("created_at", { ascending: false }),
          supabase.from("products").select("id", { count: "exact" }),
        ]);
        if (ordersRes.error) throw ordersRes.error;
        setDbConnected(true);
        setAllOrders(ordersRes.data ?? []);
        setTotalProducts(productsRes.count ?? 0);
      } catch {
        setDbConnected(false);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredOrders = useMemo(() => {
    setDashPage(1);
    return getFilteredOrders(allOrders, filter, customStart, customEnd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allOrders, filter, customApplied]);

  const pagedOrders = useMemo(
    () => filteredOrders.slice((dashPage - 1) * dashPageSize, dashPage * dashPageSize),
    [filteredOrders, dashPage, dashPageSize]
  );

  const stats = useMemo(() => ({
    totalSales:      filteredOrders.filter(o => o.status !== "Cancelled").reduce((s, o) => s + Number(o.total_amount ?? 0), 0),
    totalOrders:     filteredOrders.length,
    pendingOrders:   filteredOrders.filter(o => o.status === "Pending").length,
    cancelledOrders: filteredOrders.filter(o => o.status === "Cancelled").length,
    deliveredOrders: filteredOrders.filter(o => o.status === "Delivered").length,
  }), [filteredOrders]);

  const activeLabel = filterLabel(filter, customStart, customEnd);

  const STATUS_COLORS: Record<string, string> = {
    Pending: "#f59e0b", Preparing: "#3b82f6", Ready: "#8b5cf6", Delivered: "#10b981", Cancelled: "#ef4444",
  };

  const statusChartData = useMemo(() => {
    const counts: Record<string, number> = { Pending: 0, Preparing: 0, Ready: 0, Delivered: 0, Cancelled: 0 };
    filteredOrders.forEach(o => { if (o.status in counts) counts[o.status]++; });
    return Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [filteredOrders]);

  const dailyRevenueData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { weekday: "short" });
      const dayOrders = allOrders.filter(o => o.created_at.startsWith(dateStr) && o.status !== "Cancelled");
      days.push({ label, Revenue: parseFloat(dayOrders.reduce((s, o) => s + Number(o.total_amount), 0).toFixed(2)), Orders: dayOrders.length });
    }
    return days;
  }, [allOrders]);

  // ── PDF GENERATOR ──────────────────────────────────────────────────────────
  const generatePDF = () => {
    setPdfGenerating(true);
    const period = activeLabel;
    const now = new Date().toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" });

    const rows = filteredOrders.slice(0, 50).map((o, i) => `
      <tr style="background:${i % 2 === 0 ? "#ffffff" : "#f9fafb"}">
        <td style="padding:10px 14px;font-size:12px;color:#374151;font-weight:700">#${o.id}</td>
        <td style="padding:10px 14px;font-size:12px;color:#111827;font-weight:600">${o.customer_name}</td>
        <td style="padding:10px 14px;font-size:12px;color:#6b7280">${o.customer_phone}</td>
        <td style="padding:10px 14px;font-size:13px;color:#111827;font-weight:800">$${Number(o.total_amount).toFixed(2)}</td>
        <td style="padding:10px 14px">
          <span style="font-size:10px;font-weight:800;text-transform:uppercase;padding:3px 10px;border-radius:6px;
            background:${o.status==="Delivered"?"#f0fdf4":o.status==="Cancelled"?"#fef2f2":o.status==="Pending"?"#fefce8":"#eff6ff"};
            color:${o.status==="Delivered"?"#15803d":o.status==="Cancelled"?"#b91c1c":o.status==="Pending"?"#854d0e":"#1d4ed8"}">
            ${o.status}
          </span>
        </td>
        <td style="padding:10px 14px;font-size:11px;color:#9ca3af">${new Date(o.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"})}</td>
      </tr>`).join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>BFC Dashboard Report — ${period}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background:#fff; color:#111827; }
    @page { margin: 18mm 15mm; size: A4; }
  </style>
</head>
<body>
  <!-- HEADER -->
  <div style="background:linear-gradient(135deg,#0f0f0f 0%,#1a1a1a 60%,#2d0a0a 100%);padding:32px 36px;border-radius:0 0 16px 16px;margin-bottom:28px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
          <div style="background:#dc2626;color:#fff;font-weight:900;font-size:22px;padding:8px 14px;border-radius:10px;letter-spacing:-1px">BFC</div>
          <div>
            <div style="color:#fff;font-weight:800;font-size:15px;letter-spacing:1px">RESTAURANT & CAFE</div>
            <div style="color:#6b7280;font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase">Admin Report</div>
          </div>
        </div>
        <div style="color:#dc2626;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin-top:4px">Sihanoukville, Cambodia</div>
      </div>
      <div style="text-align:right">
        <div style="color:#9ca3af;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px">Generated</div>
        <div style="color:#fff;font-size:12px;font-weight:700">${now}</div>
        <div style="margin-top:8px;background:rgba(220,38,38,0.15);border:1px solid rgba(220,38,38,0.3);color:#fca5a5;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;padding:4px 12px;border-radius:20px;display:inline-block">
          ${FILTERS.find(f => f.value === filter)?.label ?? "All Time"}
        </div>
      </div>
    </div>
    <div style="margin-top:18px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08)">
      <div style="color:#9ca3af;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px">Report Period</div>
      <div style="color:#fff;font-size:14px;font-weight:700">${period}</div>
    </div>
  </div>

  <!-- STATS GRID -->
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px;padding:0 4px">
    ${[
      { label: "Total Revenue",   value: `$${stats.totalSales.toFixed(2)}`,       bg: "#f0fdf4", border: "#bbf7d0", label_c: "#15803d", val_c: "#14532d" },
      { label: "Total Orders",    value: stats.totalOrders.toString(),              bg: "#eff6ff", border: "#bfdbfe", label_c: "#1d4ed8", val_c: "#1e3a8a" },
      { label: "Pending Orders",  value: stats.pendingOrders.toString(),            bg: "#fefce8", border: "#fef08a", label_c: "#854d0e", val_c: "#713f12" },
      { label: "Cancelled",       value: stats.cancelledOrders.toString(),          bg: "#fef2f2", border: "#fecaca", label_c: "#b91c1c", val_c: "#7f1d1d" },
    ].map(s => `
      <div style="background:${s.bg};border:1.5px solid ${s.border};border-radius:14px;padding:18px 16px">
        <div style="font-size:9px;font-weight:800;color:${s.label_c};text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px">${s.label}</div>
        <div style="font-size:28px;font-weight:900;color:${s.val_c};line-height:1">${s.value}</div>
      </div>`).join("")}
  </div>

  <!-- SECONDARY STATS -->
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:32px;padding:0 4px">
    ${[
      { label: "Delivered Orders", value: stats.deliveredOrders.toString() },
      { label: "Menu Items",       value: totalProducts.toString() },
      { label: "Avg. Order Value", value: stats.totalOrders > 0 ? `$${(stats.totalSales / stats.totalOrders).toFixed(2)}` : "$0.00" },
    ].map(s => `
      <div style="background:#f9fafb;border:1.5px solid #e5e7eb;border-radius:14px;padding:16px">
        <div style="font-size:9px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px">${s.label}</div>
        <div style="font-size:24px;font-weight:900;color:#111827;line-height:1">${s.value}</div>
      </div>`).join("")}
  </div>

  <!-- ORDERS TABLE -->
  <div style="padding:0 4px;margin-bottom:28px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <div style="font-size:13px;font-weight:900;color:#111827;text-transform:uppercase;letter-spacing:1px">Orders Detail</div>
      <div style="font-size:10px;color:#9ca3af;font-weight:600">${filteredOrders.length > 50 ? `Showing top 50 of ${filteredOrders.length}` : `${filteredOrders.length} orders`}</div>
    </div>
    <table style="width:100%;border-collapse:collapse;border-radius:12px;overflow:hidden;border:1.5px solid #e5e7eb">
      <thead>
        <tr style="background:#111827">
          <th style="padding:11px 14px;text-align:left;font-size:9px;font-weight:800;color:#9ca3af;text-transform:uppercase;letter-spacing:1.5px">Order ID</th>
          <th style="padding:11px 14px;text-align:left;font-size:9px;font-weight:800;color:#9ca3af;text-transform:uppercase;letter-spacing:1.5px">Customer</th>
          <th style="padding:11px 14px;text-align:left;font-size:9px;font-weight:800;color:#9ca3af;text-transform:uppercase;letter-spacing:1.5px">Phone</th>
          <th style="padding:11px 14px;text-align:left;font-size:9px;font-weight:800;color:#9ca3af;text-transform:uppercase;letter-spacing:1.5px">Amount</th>
          <th style="padding:11px 14px;text-align:left;font-size:9px;font-weight:800;color:#9ca3af;text-transform:uppercase;letter-spacing:1.5px">Status</th>
          <th style="padding:11px 14px;text-align:left;font-size:9px;font-weight:800;color:#9ca3af;text-transform:uppercase;letter-spacing:1.5px">Date</th>
        </tr>
      </thead>
      <tbody>${rows || `<tr><td colspan="6" style="padding:24px;text-align:center;color:#9ca3af;font-size:13px">No orders in this period.</td></tr>`}</tbody>
    </table>
  </div>

  <!-- FOOTER -->
  <div style="border-top:2px solid #f3f4f6;padding-top:16px;display:flex;justify-content:space-between;align-items:center">
    <div style="font-size:10px;color:#9ca3af;font-weight:600">BFC Restaurant & Cafe — Confidential Report</div>
    <div style="font-size:10px;color:#9ca3af;font-weight:600">Generated by BFC Admin Panel</div>
  </div>

  <script>window.onload=()=>{window.print();}</script>
</body>
</html>`;

    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
    setTimeout(() => setPdfGenerating(false), 1500);
  };

  const cards = [
    { label: "Total Revenue",   value: `$${stats.totalSales.toFixed(2)}`,  icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", iconBg: "bg-emerald-50 text-emerald-600", sub: `${stats.deliveredOrders} delivered` },
    { label: "Total Orders",    value: stats.totalOrders.toString(),         icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",                                                                                                                                    iconBg: "bg-blue-50 text-blue-600",    sub: `${stats.pendingOrders} pending` },
    { label: "Cancelled",       value: stats.cancelledOrders.toString(),     icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",                                                                                                          iconBg: "bg-red-50 text-red-600",      sub: "Orders cancelled" },
    { label: "Menu Items",      value: totalProducts.toString(),             icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4",                                                                                              iconBg: "bg-violet-50 text-violet-600", sub: "Active products" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Showing: <span className="font-bold text-gray-700">{activeLabel}</span>
          </p>
        </div>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border ${dbConnected === null ? "bg-yellow-50 text-yellow-700 border-yellow-200" : dbConnected ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          <span className="relative flex h-2.5 w-2.5">
            {dbConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dbConnected === null ? "bg-yellow-500" : dbConnected ? "bg-green-500" : "bg-red-500"}`} />
          </span>
          {dbConnected === null ? "Connecting..." : dbConnected ? "Connected" : "Disconnected"}
        </div>
      </div>

      {/* Filter bar + Download */}
      <div className="flex flex-col gap-3 mb-7">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Filter pills */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-2xl p-1.5 shadow-sm flex-wrap">
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${filter === f.value ? "bg-zinc-900 text-white shadow-sm" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Download PDF */}
          <button
            onClick={generatePDF}
            disabled={pdfGenerating || loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-95 shrink-0"
          >
            {pdfGenerating ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            )}
            Download PDF
          </button>
        </div>

        {/* Custom date range picker — shown only when Custom is active */}
        {filter === "custom" && (
          <div className="flex flex-wrap items-end gap-3 bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">From</label>
              <input
                type="date"
                value={customStart}
                max={customEnd}
                onChange={e => setCustomStart(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 bg-gray-50 focus:outline-none focus:border-zinc-400 focus:bg-white transition-all"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">To</label>
              <input
                type="date"
                value={customEnd}
                min={customStart}
                max={todayStr()}
                onChange={e => setCustomEnd(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 bg-gray-50 focus:outline-none focus:border-zinc-400 focus:bg-white transition-all"
              />
            </div>
            <button
              onClick={() => setCustomApplied(p => !p)}
              disabled={!customStart || !customEnd}
              className="flex items-center gap-2 px-5 py-2 bg-zinc-900 hover:bg-zinc-700 disabled:opacity-40 text-white text-sm font-black rounded-xl transition-all active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" /></svg>
              Apply
            </button>
            {customStart && customEnd && (
              <p className="text-xs text-gray-400 font-medium self-end pb-2">
                {activeLabel}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{card.label}</p>
                <h3 className={`text-3xl font-black transition-all ${loading ? "text-gray-200 animate-pulse" : "text-gray-900"}`}>
                  {loading ? "---" : card.value}
                </h3>
              </div>
              <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} /></svg>
              </div>
            </div>
            <p className="text-xs text-gray-400 font-medium">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Manage Orders",   desc: "View & update order status",      href: "/admin/orders",    color: "bg-blue-600" },
          { label: "Manage Products", desc: "Add, edit, or remove menu items", href: "/admin/products",  color: "bg-red-600" },
          { label: "View Customers",  desc: "Browse customer history",         href: "/admin/customers", color: "bg-violet-600" },
        ].map(link => (
          <Link key={link.href} href={link.href} className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all hover:-translate-y-0.5 flex items-center gap-4">
            <div className={`w-10 h-10 ${link.color} rounded-xl flex items-center justify-center shrink-0`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm group-hover:text-red-600 transition-colors">{link.label}</p>
              <p className="text-gray-400 text-xs mt-0.5">{link.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-8">

        {/* Donut — Order Status Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="mb-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Order Status</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">Breakdown by status</p>
          </div>
          {statusChartData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-gray-300 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusChartData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? "#9ca3af"} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v} orders`, ""]} contentStyle={{ borderRadius: "12px", border: "1px solid #f3f4f6", fontSize: "12px" }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", fontWeight: 700 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar — Daily Revenue (last 7 days) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Revenue</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">Last 7 days</p>
            </div>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">This Week</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyRevenueData} barSize={28} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fontWeight: 700, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v: number, name: string) => [name === "Revenue" ? `$${v.toFixed(2)}` : v, name]}
                contentStyle={{ borderRadius: "12px", border: "1px solid #f3f4f6", fontSize: "12px" }}
                cursor={{ fill: "#f9fafb" }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", fontWeight: 700 }} />
              <Bar dataKey="Revenue" fill="#dc2626" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Orders" fill="#1f2937" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-black text-gray-900 uppercase tracking-tight text-sm">Orders</h2>
            <p className="text-gray-400 text-xs mt-0.5">{filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""} in period</p>
          </div>
          <Link href="/admin/orders" className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors">View All →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/60">
                <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-wider hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}</tr>
                  ))
                : filteredOrders.length === 0
                  ? <tr><td colSpan={5} className="text-center py-14 text-gray-400 text-sm">No orders in this period.</td></tr>
                  : pagedOrders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4 text-xs font-black text-gray-500">#{order.id}</td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-sm text-gray-900">{order.customer_name}</p>
                          <p className="text-xs text-gray-400">{order.customer_phone}</p>
                        </td>
                        <td className="px-6 py-4 font-black text-gray-900 text-sm">${Number(order.total_amount).toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${statusColors[order.status] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-400 hidden md:table-cell">
                          {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    ))
              }
            </tbody>
          </table>
        </div>
        <Pagination
          total={filteredOrders.length}
          pageSize={dashPageSize}
          page={dashPage}
          onPageChange={setDashPage}
          onPageSizeChange={setDashPageSize}
        />
      </div>
    </div>
  );
}
