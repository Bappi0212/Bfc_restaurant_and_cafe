"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import Pagination from "../components/Pagination";

type RawOrder = {
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  status: string;
  created_at: string;
};

type Customer = {
  name: string;
  customer_phone: string;
  orderCount: number;
  totalSpent: number;
  lastOrder: string;
  statuses: string[];
};

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState("");
  const [sortBy, setSortBy] = useState<"orders" | "spent" | "recent">("recent");
  const [page, setPage]       = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("orders")
        .select("customer_name, customer_phone, total_amount, status, created_at")
        .order("created_at", { ascending: false });

      if (error || !data) { setLoading(false); return; }

      const map = new Map<string, Customer>();
      (data as RawOrder[]).forEach(o => {
        const key = o.customer_phone.trim();
        if (map.has(key)) {
          const c = map.get(key)!;
          c.orderCount += 1;
          c.totalSpent += Number(o.total_amount ?? 0);
          c.statuses.push(o.status);
        } else {
          map.set(key, {
            name: o.customer_name,
            customer_phone: key,
            orderCount: 1,
            totalSpent: Number(o.total_amount ?? 0),
            lastOrder: o.created_at,
            statuses: [o.status],
          });
        }
      });

      setCustomers(Array.from(map.values()));
      setLoading(false);
    }
    load();
  }, []);

  const sorted = useMemo(() => {
    setPage(1);
    return [...customers]
      .filter(c => !searchQ || c.name.toLowerCase().includes(searchQ.toLowerCase()) || c.customer_phone.includes(searchQ))
      .sort((a, b) => {
        if (sortBy === "orders") return b.orderCount - a.orderCount;
        if (sortBy === "spent")  return b.totalSpent - a.totalSpent;
        return new Date(b.lastOrder).getTime() - new Date(a.lastOrder).getTime();
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customers, searchQ, sortBy]);

  const pagedCustomers = useMemo(
    () => sorted.slice((page - 1) * pageSize, page * pageSize),
    [sorted, page, pageSize]
  );

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
  const avgSpend = customers.length > 0 ? totalRevenue / customers.reduce((s, c) => s + c.orderCount, 0) : 0;

  const initials = (name: string) => name.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2);
  const avatarColor = (name: string) => {
    const colors = ["bg-red-500", "bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-orange-500", "bg-pink-500"];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">Customers</h1>
        <p className="text-gray-500 text-sm mt-1">{customers.length} unique customers from order history</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Customers", value: customers.length.toString(), icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", bg: "bg-blue-50 text-blue-600" },
          { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", bg: "bg-emerald-50 text-emerald-600" },
          { label: "Avg. Order Value", value: `$${avgSpend.toFixed(2)}`, icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", bg: "bg-violet-50 text-violet-600" },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} /></svg>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{card.label}</p>
              <p className={`text-2xl font-black ${loading ? "text-gray-200 animate-pulse" : "text-gray-900"}`}>{loading ? "---" : card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" /></svg>
          <input type="text" placeholder="Search by name or phone..." value={searchQ} onChange={e => setSearchQ(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all shadow-sm" />
        </div>
        <div className="flex gap-2">
          {([["recent", "Recent"], ["orders", "Most Orders"], ["spent", "Top Spenders"]] as const).map(([val, label]) => (
            <button key={val} onClick={() => setSortBy(val)} className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border whitespace-nowrap transition-all ${sortBy === val ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/60 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider hidden sm:table-cell">Phone</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Spent</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider hidden md:table-cell">Last Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
                : sorted.length === 0
                  ? <tr><td colSpan={5} className="text-center py-16 text-gray-400 text-sm">No customers found.</td></tr>
                  : pagedCustomers.map((c, i) => (
                    <tr key={c.customer_phone} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 ${avatarColor(c.name)} rounded-full flex items-center justify-center text-white text-xs font-black shrink-0`}>
                            {initials(c.name)}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-900">{c.name}</p>
                            <p className="text-[10px] text-gray-400 sm:hidden">{c.customer_phone}</p>
                          </div>
                          {i === 0 && sortBy === "spent" && <span className="text-[9px] font-black bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-md">TOP</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">{c.customer_phone}</td>
                      <td className="px-6 py-4">
                        <span className="font-black text-sm text-gray-900">{c.orderCount}</span>
                        <span className="text-xs text-gray-400 ml-1">order{c.orderCount !== 1 ? "s" : ""}</span>
                      </td>
                      <td className="px-6 py-4 font-black text-emerald-600 text-sm">${c.totalSpent.toFixed(2)}</td>
                      <td className="px-6 py-4 text-xs text-gray-400 hidden md:table-cell">
                        {new Date(c.lastOrder).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        <Pagination
          total={sorted.length}
          pageSize={pageSize}
          page={page}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
}
