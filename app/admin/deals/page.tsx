"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

type Deal = {
  id: number;
  title: string;
  description: string;
  price: string;
  badge: string;
  gradient: string;
  is_active: boolean;
  sort_order: number;
};

type FormData = {
  title: string;
  description: string;
  price: string;
  badge: string;
  gradient: string;
  is_active: boolean;
};

const emptyForm: FormData = {
  title: "",
  description: "",
  price: "",
  badge: "",
  gradient: "from-red-600 to-red-800",
  is_active: true,
};

const GRADIENTS = [
  { label: "Red", value: "from-red-600 to-red-800", preview: "from-red-600 to-red-800" },
  { label: "Orange", value: "from-orange-500 to-orange-700", preview: "from-orange-500 to-orange-700" },
  { label: "Dark", value: "from-zinc-800 to-zinc-950", preview: "from-zinc-800 to-zinc-950" },
  { label: "Green", value: "from-green-600 to-green-800", preview: "from-green-600 to-green-800" },
  { label: "Blue", value: "from-blue-600 to-blue-800", preview: "from-blue-600 to-blue-800" },
  { label: "Purple", value: "from-violet-600 to-violet-800", preview: "from-violet-600 to-violet-800" },
  { label: "Amber", value: "from-amber-500 to-amber-700", preview: "from-amber-500 to-amber-700" },
  { label: "Pink", value: "from-pink-600 to-pink-800", preview: "from-pink-600 to-pink-800" },
];

export default function AdminDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const fetchDeals = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("special_deals").select("*").order("sort_order", { ascending: true });
    if (!error) setDeals(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchDeals(); }, []);

  const openAdd = () => { setFormData(emptyForm); setEditingId(null); setIsModalOpen(true); };
  const openEdit = (d: Deal) => {
    setFormData({ title: d.title, description: d.description, price: d.price, badge: d.badge, gradient: d.gradient, is_active: d.is_active });
    setEditingId(d.id);
    setIsModalOpen(true);
  };
  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setFormData(emptyForm); };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.title || !formData.price) return;
    setIsSubmitting(true);
    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: formData.price.trim(),
      badge: formData.badge.trim(),
      gradient: formData.gradient,
      is_active: formData.is_active,
      sort_order: editingId !== null ? (deals.find(d => d.id === editingId)?.sort_order ?? 0) : deals.length,
    };
    const { error } = editingId !== null
      ? await supabase.from("special_deals").update(payload).eq("id", editingId)
      : await supabase.from("special_deals").insert([payload]);
    if (error) { showToast("Error: " + error.message); }
    else { closeModal(); fetchDeals(); showToast(editingId !== null ? "Deal updated!" : "Deal created!"); }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("special_deals").delete().eq("id", id);
    if (!error) { setDeleteConfirm(null); fetchDeals(); showToast("Deal deleted."); }
  };

  const toggleActive = async (deal: Deal) => {
    const { error } = await supabase.from("special_deals").update({ is_active: !deal.is_active }).eq("id", deal.id);
    if (!error) setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, is_active: !d.is_active } : d));
  };

  const moveOrder = async (deal: Deal, dir: -1 | 1) => {
    const idx = deals.findIndex(d => d.id === deal.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= deals.length) return;
    const swap = deals[swapIdx];
    await Promise.all([
      supabase.from("special_deals").update({ sort_order: swap.sort_order }).eq("id", deal.id),
      supabase.from("special_deals").update({ sort_order: deal.sort_order }).eq("id", swap.id),
    ]);
    fetchDeals();
  };

  // Live preview card
  const PreviewCard = ({ data }: { data: FormData }) => (
    <div className={`bg-gradient-to-br ${data.gradient} rounded-2xl p-6 text-white relative overflow-hidden`}>
      {data.badge && (
        <span className="absolute top-4 right-4 text-[10px] font-black uppercase bg-white/15 px-2.5 py-1 rounded-full border border-white/20">{data.badge}</span>
      )}
      <h4 className="text-xl font-black mb-1">{data.title || "Deal Title"}</h4>
      <p className="text-white/60 text-xs mb-4 leading-relaxed">{data.description || "Deal description goes here..."}</p>
      <p className="text-3xl font-black">{data.price || "$0.00"}</p>
      <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-white/5 rounded-full" />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">Special Deals</h1>
          <p className="text-gray-500 text-sm mt-1">{deals.length} deal{deals.length !== 1 ? "s" : ""} — shown on the main website</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-95">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          Add Deal
        </button>
      </div>

      {/* Deals Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : deals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <svg className="w-16 h-16 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
          <p className="font-bold text-lg">No deals yet</p>
          <p className="text-sm mt-1">Click "Add Deal" to create your first special offer.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {deals.map((deal, idx) => (
            <div key={deal.id} className={`relative rounded-2xl overflow-hidden border-2 transition-all ${deal.is_active ? "border-transparent" : "border-gray-200 opacity-60"}`}>
              {/* Deal preview card */}
              <div className={`bg-gradient-to-br ${deal.gradient} p-6 text-white relative overflow-hidden`}>
                {deal.badge && (
                  <span className="absolute top-4 right-4 text-[10px] font-black uppercase bg-white/15 px-2.5 py-1 rounded-full border border-white/20">{deal.badge}</span>
                )}
                <h4 className="text-xl font-black mb-1 pr-20">{deal.title}</h4>
                <p className="text-white/60 text-xs mb-4 leading-relaxed">{deal.description}</p>
                <p className="text-3xl font-black">{deal.price}</p>
                <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-white/5 rounded-full" />
              </div>

              {/* Controls bar */}
              <div className="bg-white px-4 py-3 flex items-center justify-between gap-2 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  {/* Move up/down */}
                  <button onClick={() => moveOrder(deal, -1)} disabled={idx === 0} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-30" title="Move up">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <button onClick={() => moveOrder(deal, 1)} disabled={idx === deals.length - 1} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-30" title="Move down">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 ml-auto">
                  {/* Active toggle */}
                  <button onClick={() => toggleActive(deal)} className={`text-[10px] font-black px-2.5 py-1 rounded-lg border transition-all ${deal.is_active ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                    {deal.is_active ? "● Active" : "○ Hidden"}
                  </button>
                  <button onClick={() => openEdit(deal)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => setDeleteConfirm(deal.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-4">
            <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">{editingId !== null ? "Edit Deal" : "Add New Deal"}</h2>
              <button onClick={closeModal} className="p-2 bg-gray-50 rounded-full text-gray-500 hover:text-red-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex flex-col lg:flex-row">
              {/* Form */}
              <form onSubmit={handleSubmit} className="flex-1 p-7 space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Deal Title *</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Family Feast" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all" />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Description</label>
                  <input type="text" value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} placeholder="e.g. 4 pcs chicken + 2 burgers + 4 drinks" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Price *</label>
                    <input required type="text" value={formData.price} onChange={e => setFormData(f => ({ ...f, price: e.target.value }))} placeholder="e.g. $14.99" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Badge Text</label>
                    <input type="text" value={formData.badge} onChange={e => setFormData(f => ({ ...f, badge: e.target.value }))} placeholder="e.g. Save 30%" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all" />
                  </div>
                </div>

                {/* Gradient picker */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2">Card Color</label>
                  <div className="grid grid-cols-4 gap-2">
                    {GRADIENTS.map(g => (
                      <button key={g.value} type="button" onClick={() => setFormData(f => ({ ...f, gradient: g.value }))} className={`relative h-10 bg-gradient-to-br ${g.preview} rounded-xl transition-all border-2 ${formData.gradient === g.value ? "border-white ring-2 ring-gray-900 scale-105" : "border-transparent"}`} title={g.label}>
                        {formData.gradient === g.value && (
                          <svg className="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active toggle */}
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <div>
                    <p className="font-bold text-sm text-gray-900">Show on website</p>
                    <p className="text-xs text-gray-400 mt-0.5">Toggle to hide this deal without deleting it</p>
                  </div>
                  <button type="button" onClick={() => setFormData(f => ({ ...f, is_active: !f.is_active }))} className={`relative w-11 h-6 rounded-full transition-colors ${formData.is_active ? "bg-red-600" : "bg-gray-200"}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${formData.is_active ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={closeModal} className="flex-1 py-3 bg-gray-50 border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors active:scale-95">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-colors active:scale-95">
                    {isSubmitting ? "Saving..." : editingId !== null ? "Save Changes" : "Create Deal"}
                  </button>
                </div>
              </form>

              {/* Live preview */}
              <div className="lg:w-72 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-100 p-6 flex flex-col">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">Live Preview</p>
                <PreviewCard data={formData} />
                <p className="text-[10px] text-gray-400 mt-3 text-center">This is how it will look on the website</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-7 shadow-2xl max-w-sm w-full text-center">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="font-black text-gray-900 text-lg mb-2">Delete Deal?</h3>
            <p className="text-gray-500 text-sm mb-6">This will remove the deal from the website permanently.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-100">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] animate-[toastIn_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)]">
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl bg-zinc-900 text-white border border-zinc-800" style={{ minWidth: "220px" }}>
            <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="text-sm font-semibold">{toast}</p>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `@keyframes toastIn{from{transform:translate(-50%,20px);opacity:0}to{transform:translate(-50%,0);opacity:1}}` }} />
    </div>
  );
}
