"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

type Slide = {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  cta_text: string;
  image_url: string;
  gradient: string;
  is_active: boolean;
  sort_order: number;
};

type FormData = {
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  cta_text: string;
  image_url: string;
  gradient: string;
  is_active: boolean;
};

const emptyForm: FormData = {
  badge: "",
  title: "",
  subtitle: "",
  description: "",
  cta_text: "Order Now",
  image_url: "",
  gradient: "from-red-950/90 via-red-900/50",
  is_active: true,
};

const GRADIENTS = [
  { label: "Red",    value: "from-red-950/90 via-red-900/50",    bg: "bg-red-900" },
  { label: "Amber",  value: "from-amber-950/90 via-amber-900/50", bg: "bg-amber-900" },
  { label: "Orange", value: "from-orange-950/90 via-orange-900/50", bg: "bg-orange-900" },
  { label: "Dark",   value: "from-zinc-950/90 via-zinc-900/50",   bg: "bg-zinc-800" },
  { label: "Blue",   value: "from-blue-950/90 via-blue-900/50",   bg: "bg-blue-900" },
  { label: "Purple", value: "from-violet-950/90 via-violet-900/50", bg: "bg-violet-900" },
  { label: "Green",  value: "from-green-950/90 via-green-900/50", bg: "bg-green-900" },
  { label: "Rose",   value: "from-rose-950/90 via-rose-900/50",   bg: "bg-rose-900" },
];

export default function AdminHero() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  const fetchSlides = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("hero_slides").select("*").order("sort_order", { ascending: true });
    if (!error) setSlides(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchSlides(); }, []);

  const openAdd = () => { setFormData(emptyForm); setEditingId(null); setIsModalOpen(true); };
  const openEdit = (s: Slide) => {
    setFormData({ badge: s.badge, title: s.title, subtitle: s.subtitle, description: s.description, cta_text: s.cta_text, image_url: s.image_url, gradient: s.gradient, is_active: s.is_active });
    setEditingId(s.id);
    setIsModalOpen(true);
  };
  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setFormData(emptyForm); };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `hero-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(fileName, file);
    if (error) { showToast("Image upload failed: " + error.message, false); setImageUploading(false); return; }
    const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
    setFormData(f => ({ ...f, image_url: data.publicUrl }));
    setImageUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.title || !formData.image_url) return;
    setIsSubmitting(true);
    const payload = {
      badge: formData.badge.trim(),
      title: formData.title.trim(),
      subtitle: formData.subtitle.trim(),
      description: formData.description.trim(),
      cta_text: formData.cta_text.trim() || "Order Now",
      image_url: formData.image_url.trim(),
      gradient: formData.gradient,
      is_active: formData.is_active,
      sort_order: editingId !== null ? (slides.find(s => s.id === editingId)?.sort_order ?? 0) : slides.length,
    };
    const { error } = editingId !== null
      ? await supabase.from("hero_slides").update(payload).eq("id", editingId)
      : await supabase.from("hero_slides").insert([payload]);
    if (error) { showToast("Error: " + error.message, false); }
    else { closeModal(); fetchSlides(); showToast(editingId !== null ? "Slide updated!" : "Slide created!"); }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("hero_slides").delete().eq("id", id);
    if (!error) { setDeleteConfirm(null); fetchSlides(); showToast("Slide deleted."); }
  };

  const toggleActive = async (slide: Slide) => {
    const { error } = await supabase.from("hero_slides").update({ is_active: !slide.is_active }).eq("id", slide.id);
    if (!error) setSlides(prev => prev.map(s => s.id === slide.id ? { ...s, is_active: !s.is_active } : s));
  };

  const moveOrder = async (slide: Slide, dir: -1 | 1) => {
    const idx = slides.findIndex(s => s.id === slide.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= slides.length) return;
    const swap = slides[swapIdx];
    await Promise.all([
      supabase.from("hero_slides").update({ sort_order: swap.sort_order }).eq("id", slide.id),
      supabase.from("hero_slides").update({ sort_order: slide.sort_order }).eq("id", swap.id),
    ]);
    fetchSlides();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">Hero Slides</h1>
          <p className="text-gray-500 text-sm mt-1">{slides.length} slide{slides.length !== 1 ? "s" : ""} — auto-rotates on the homepage</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-95">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          Add Slide
        </button>
      </div>

      {/* Slides Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-56 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : slides.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <svg className="w-16 h-16 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <p className="font-bold text-lg">No slides yet</p>
          <p className="text-sm mt-1">Click "Add Slide" to create the first hero slide.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {slides.map((slide, idx) => (
            <div key={slide.id} className={`rounded-2xl overflow-hidden border-2 transition-all ${slide.is_active ? "border-transparent" : "border-gray-200 opacity-60"}`}>
              {/* Mini hero preview */}
              <div className="relative h-48 overflow-hidden bg-gray-900">
                {slide.image_url && (
                  <img src={slide.image_url} alt={slide.title} className="absolute inset-0 w-full h-full object-cover" />
                )}
                <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} to-transparent`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                  {slide.badge && (
                    <span className="inline-block text-[9px] font-black uppercase bg-white/15 backdrop-blur-sm border border-white/20 px-2 py-0.5 rounded-full text-white mb-2 w-max">
                      {slide.badge}
                    </span>
                  )}
                  <h4 className="text-white font-black text-lg leading-tight whitespace-pre-line line-clamp-2">{slide.title}</h4>
                  {slide.subtitle && <p className="text-red-400 text-[11px] font-bold mt-0.5 line-clamp-1">{slide.subtitle}</p>}
                  {slide.description && <p className="text-gray-300 text-[10px] mt-1 line-clamp-1">{slide.description}</p>}
                  <div className="mt-2">
                    <span className="text-[10px] font-black bg-red-600 text-white px-3 py-1 rounded-full">{slide.cta_text || "Order Now"}</span>
                  </div>
                </div>
                {/* Slide number badge */}
                <div className="absolute top-3 left-3 w-6 h-6 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-[10px] font-black">
                  {idx + 1}
                </div>
              </div>

              {/* Controls */}
              <div className="bg-white px-4 py-3 flex items-center justify-between gap-2 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <button onClick={() => moveOrder(slide, -1)} disabled={idx === 0} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-30" title="Move left">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <button onClick={() => moveOrder(slide, 1)} disabled={idx === slides.length - 1} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-30" title="Move right">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                  <button onClick={() => toggleActive(slide)} className={`text-[10px] font-black px-2.5 py-1 rounded-lg border transition-all ${slide.is_active ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                    {slide.is_active ? "● Active" : "○ Hidden"}
                  </button>
                  <button onClick={() => openEdit(slide)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => setDeleteConfirm(slide.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
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
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">{editingId !== null ? "Edit Slide" : "Add New Slide"}</h2>
              <button onClick={closeModal} className="p-2 bg-gray-50 rounded-full text-gray-500 hover:text-red-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-7 space-y-4">
              {/* Image */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Background Image *</label>
                {formData.image_url && (
                  <div className="relative mb-2 w-full h-32 rounded-xl overflow-hidden bg-gray-100">
                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setFormData(f => ({ ...f, image_url: "" }))} className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full text-white text-xs flex items-center justify-center hover:bg-red-600 transition-colors">✕</button>
                  </div>
                )}
                <div className="flex gap-2">
                  <input type="url" value={formData.image_url} onChange={e => setFormData(f => ({ ...f, image_url: e.target.value }))} placeholder="https://... (paste image URL)" className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all" />
                  <label className={`flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-red-400 hover:bg-red-50/30 transition-all text-xs font-bold text-gray-500 whitespace-nowrap ${imageUploading ? "opacity-60 pointer-events-none" : ""}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {imageUploading ? "Uploading..." : "Upload"}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Badge Text</label>
                  <input type="text" value={formData.badge} onChange={e => setFormData(f => ({ ...f, badge: e.target.value }))} placeholder="e.g. Hot Deal" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Button Text</label>
                  <input type="text" value={formData.cta_text} onChange={e => setFormData(f => ({ ...f, cta_text: e.target.value }))} placeholder="e.g. Order Now" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">
                  Main Title * <span className="normal-case text-gray-300 font-normal">(use Enter for line break)</span>
                </label>
                <textarea required rows={2} value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} placeholder={"e.g. Signature\nFried Chicken"} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all resize-none" />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Subtitle <span className="normal-case text-gray-300 font-normal">(shown in red)</span></label>
                <input type="text" value={formData.subtitle} onChange={e => setFormData(f => ({ ...f, subtitle: e.target.value }))} placeholder="e.g. 20% Extra Pieces Today Only" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all" />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Description</label>
                <input type="text" value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Perfectly marinated, golden crispy and 100% fresh." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all" />
              </div>

              {/* Gradient overlay */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2">Overlay Color</label>
                <div className="grid grid-cols-8 gap-2">
                  {GRADIENTS.map(g => (
                    <button key={g.value} type="button" onClick={() => setFormData(f => ({ ...f, gradient: g.value }))} title={g.label} className={`relative h-9 ${g.bg} rounded-xl border-2 transition-all ${formData.gradient === g.value ? "border-white ring-2 ring-gray-900 scale-105" : "border-transparent opacity-70 hover:opacity-100"}`}>
                      {formData.gradient === g.value && (
                        <svg className="absolute inset-0 m-auto w-3.5 h-3.5 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Selected: {GRADIENTS.find(g => g.value === formData.gradient)?.label ?? "Custom"}</p>
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div>
                  <p className="font-bold text-sm text-gray-900">Show on homepage</p>
                  <p className="text-xs text-gray-400 mt-0.5">Toggle to hide this slide without deleting</p>
                </div>
                <button type="button" onClick={() => setFormData(f => ({ ...f, is_active: !f.is_active }))} className={`relative w-11 h-6 rounded-full transition-colors ${formData.is_active ? "bg-red-600" : "bg-gray-200"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${formData.is_active ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeModal} className="flex-1 py-3 bg-gray-50 border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors active:scale-95">Cancel</button>
                <button type="submit" disabled={isSubmitting || imageUploading || !formData.image_url} className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-colors active:scale-95">
                  {isSubmitting ? "Saving..." : editingId !== null ? "Save Changes" : "Add Slide"}
                </button>
              </div>
            </form>
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
            <h3 className="font-black text-gray-900 text-lg mb-2">Delete Slide?</h3>
            <p className="text-gray-500 text-sm mb-6">This slide will be permanently removed from the homepage.</p>
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
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-white ${toast.ok ? "bg-zinc-900 border-zinc-800" : "bg-red-900 border-red-800"}`} style={{ minWidth: "220px" }}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${toast.ok ? "bg-green-500" : "bg-red-500"}`}>
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {toast.ok ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />}
              </svg>
            </div>
            <p className="text-sm font-semibold">{toast.msg}</p>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `@keyframes toastIn{from{transform:translate(-50%,20px);opacity:0}to{transform:translate(-50%,0);opacity:1}}` }} />
    </div>
  );
}
