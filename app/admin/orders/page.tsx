"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import Pagination from "../components/Pagination";

type OrderItem = { id: number; name: string; price: string; numericPrice: number; quantity: number; image?: string };
type Order = {
  id: number;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  note?: string;
  payment_method: string;
  items: OrderItem[];
  total_amount: number;
  status: string;
  created_at: string;
};

const STATUSES = ["Pending", "Preparing", "Ready", "Delivered", "Cancelled"];

const statusConfig: Record<string, { label: string; color: string; next?: string }> = {
  Pending:   { label: "Pending",   color: "bg-yellow-50 text-yellow-700 border-yellow-200", next: "Preparing" },
  Preparing: { label: "Preparing", color: "bg-blue-50 text-blue-700 border-blue-200",       next: "Ready" },
  Ready:     { label: "Ready",     color: "bg-purple-50 text-purple-700 border-purple-200",  next: "Delivered" },
  Delivered: { label: "Delivered", color: "bg-green-50 text-green-700 border-green-200" },
  Cancelled: { label: "Cancelled", color: "bg-red-50 text-red-700 border-red-200" },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [page, setPage]             = useState(1);
  const [pageSize, setPageSize]     = useState(10);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setOrders(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (id: number, status: string) => {
    setUpdatingId(id);
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (!error) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      if (selectedOrder?.id === id) setSelectedOrder(prev => prev ? { ...prev, status } : null);
    }
    setUpdatingId(null);
  };

  const visibleOrders = useMemo(() => {
    setPage(1);
    return orders.filter(o => {
      const statusOk = filterStatus === "all" || o.status === filterStatus;
      const searchOk = !searchQ || o.customer_name.toLowerCase().includes(searchQ.toLowerCase()) || o.customer_phone.includes(searchQ) || String(o.id).includes(searchQ);
      return statusOk && searchOk;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, filterStatus, searchQ]);

  const pagedOrders = useMemo(
    () => visibleOrders.slice((page - 1) * pageSize, page * pageSize),
    [visibleOrders, page, pageSize]
  );

  const statusCounts = STATUSES.reduce<Record<string, number>>((acc, s) => ({ ...acc, [s]: orders.filter(o => o.status === s).length }), {});

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">{orders.length} total orders received</p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm active:scale-95">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refresh
        </button>
      </div>

      {/* Status summary chips */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button onClick={() => setFilterStatus("all")} className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${filterStatus === "all" ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}>
          All ({orders.length})
        </button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all capitalize ${filterStatus === s ? `${statusConfig[s].color} border-current` : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"}`}>
            {statusConfig[s].label} ({statusCounts[s] ?? 0})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" /></svg>
        <input type="text" placeholder="Search by name, phone, or order ID..." value={searchQ} onChange={e => setSearchQ(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all shadow-sm" />
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/60 border-b border-gray-100">
                <th className="px-5 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Order</th>
                <th className="px-5 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-5 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider hidden md:table-cell">Items</th>
                <th className="px-5 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Total</th>
                <th className="px-5 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
                : visibleOrders.length === 0
                  ? <tr><td colSpan={6} className="text-center py-16 text-gray-400 text-sm">No orders found.</td></tr>
                  : pagedOrders.map(order => {
                    const cfg = statusConfig[order.status] ?? statusConfig.Pending;
                    const items: OrderItem[] = Array.isArray(order.items) ? order.items : [];
                    return (
                      <tr key={order.id} className="hover:bg-gray-50/60 transition-colors group">
                        <td className="px-5 py-4">
                          <p className="font-black text-xs text-gray-400">#{order.id}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5 hidden sm:block">
                            {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-sm text-gray-900">{order.customer_name}</p>
                          <p className="text-xs text-gray-400">{order.customer_phone}</p>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2 shrink-0">
                              {items.slice(0, 3).map((it, idx) => (
                                it.image
                                  ? <img key={idx} src={it.image} alt={it.name} title={it.name} className="w-9 h-9 rounded-xl object-cover border-2 border-white shadow-sm" style={{ zIndex: 3 - idx }} />
                                  : <div key={idx} className="w-9 h-9 rounded-xl bg-gray-100 border-2 border-white flex items-center justify-center text-[8px] text-gray-400 font-bold shadow-sm" style={{ zIndex: 3 - idx }}>?</div>
                              ))}
                              {items.length > 3 && (
                                <div className="w-9 h-9 rounded-xl bg-zinc-800 border-2 border-white flex items-center justify-center text-[9px] text-white font-black shadow-sm">+{items.length - 3}</div>
                              )}
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 font-semibold">{items.length} item{items.length !== 1 ? "s" : ""}</p>
                              <p className="text-[10px] text-gray-400 truncate max-w-[120px]">{items[0]?.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-black text-gray-900 text-sm">${Number(order.total_amount).toFixed(2)}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => setSelectedOrder(order)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View details">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>
                            {cfg.next && (
                              <button disabled={updatingId === order.id} onClick={() => updateStatus(order.id, cfg.next!)} className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-700 disabled:opacity-50 text-white text-[10px] font-black rounded-lg transition-all capitalize">
                                {updatingId === order.id ? "..." : `→ ${statusConfig[cfg.next!].label}`}
                              </button>
                            )}
                            {order.status !== "Cancelled" && order.status !== "Delivered" && (
                              <button disabled={updatingId === order.id} onClick={() => updateStatus(order.id, "Cancelled")} className="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Cancel order">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>
        <Pagination
          total={visibleOrders.length}
          pageSize={pageSize}
          page={page}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="font-black text-gray-900 text-lg uppercase">Order #{selectedOrder.id}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${statusConfig[selectedOrder.status]?.color ?? ""}`}>
                  {statusConfig[selectedOrder.status]?.label}
                </span>
                <button onClick={() => setSelectedOrder(null)} className="p-2 bg-gray-50 rounded-full text-gray-500 hover:text-red-600 transition-colors active:scale-95">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-7 space-y-5">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-2xl p-5 space-y-2.5">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">Customer Info</h3>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{selectedOrder.customer_name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{selectedOrder.customer_phone}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Delivery Address</p>
                  <p className="text-sm text-gray-700">{selectedOrder.delivery_address}</p>
                </div>
                {selectedOrder.note && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Note</p>
                    <p className="text-sm text-gray-700 italic">"{selectedOrder.note}"</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Payment</p>
                  <p className="text-sm text-gray-700">{selectedOrder.payment_method}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">
                  Order Items <span className="text-gray-300 normal-case font-semibold">({(Array.isArray(selectedOrder.items) ? selectedOrder.items : []).length} items)</span>
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {(Array.isArray(selectedOrder.items) ? selectedOrder.items : []).map((item, i) => (
                    <div key={i} className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex flex-col">
                      <div className="relative w-full h-32 bg-gray-200 shrink-0">
                        {item.image
                          ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                          )
                        }
                        <div className="absolute top-2 left-2 bg-zinc-900/80 backdrop-blur-sm text-white text-[10px] font-black px-2 py-0.5 rounded-lg">
                          x{item.quantity}
                        </div>
                      </div>
                      <div className="p-3 flex flex-col flex-1 justify-between">
                        <p className="font-black text-sm text-gray-900 leading-snug line-clamp-2">{item.name}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-[10px] text-gray-400 font-semibold">{item.price} each</p>
                          <p className="font-black text-sm text-red-600">${(item.numericPrice * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-4 bg-zinc-900 text-white px-5 py-3.5 rounded-2xl">
                  <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Total Amount</span>
                  <span className="font-black text-xl">${Number(selectedOrder.total_amount).toFixed(2)}</span>
                </div>
              </div>

              {/* Status Update */}
              {selectedOrder.status !== "Delivered" && selectedOrder.status !== "Cancelled" && (
                <div>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">Update Status</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {STATUSES.filter(s => s !== selectedOrder.status && s !== "Pending").map(s => (
                      <button key={s} disabled={updatingId === selectedOrder.id} onClick={() => updateStatus(selectedOrder.id, s)} className={`py-2.5 rounded-xl text-xs font-black uppercase border transition-all disabled:opacity-50 capitalize ${statusConfig[s].color}`}>
                        Mark as {statusConfig[s].label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
