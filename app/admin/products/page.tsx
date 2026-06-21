"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import Pagination from "../components/Pagination";

type Product = {
  id: number;
  name: string;
  category: string;
  price: string;
  numericPrice: number;
  image: string;
  desc: string;
  discount?: number | null;
};

type FormData = {
  name: string;
  category: string;
  numericPrice: string;
  discount: string;
  image: string;
  desc: string;
};

const emptyForm: FormData = { name: "", category: "Chicken", numericPrice: "", discount: "", image: "", desc: "" };
const CATEGORIES = ["Chicken", "Burger", "Snacks", "Drinks"];

const categoryColors: Record<string, string> = {
  Chicken: "bg-orange-50 text-orange-700 border-orange-200",
  Burger: "bg-amber-50 text-amber-700 border-amber-200",
  Snacks: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Drinks: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [imageUploading, setImageUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchQ, setSearchQ] = useState("");
  const [page, setPage]       = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("id", { ascending: false });
    if (!error) setProducts(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const openAdd = () => { setFormData(emptyForm); setEditingId(null); setIsModalOpen(true); };
  const openEdit = (p: Product) => { setFormData({ name: p.name, category: p.category, numericPrice: String(p.numericPrice), discount: p.discount ? String(p.discount) : "", image: p.image, desc: p.desc }); setEditingId(p.id); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setFormData(emptyForm); };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(fileName, file);
    if (error) { alert("Image upload failed: " + error.message); setImageUploading(false); return; }
    const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
    setFormData(f => ({ ...f, image: data.publicUrl }));
    setImageUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name || !formData.numericPrice) return;
    setIsSubmitting(true);
    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      price: `$${Number(formData.numericPrice).toFixed(2)}`,
      numericPrice: Number(formData.numericPrice),
      discount: formData.discount ? Number(formData.discount) : null,
      image: formData.image,
      desc: formData.desc.trim(),
    };

    const { error } = editingId !== null
      ? await supabase.from("products").update(payload).eq("id", editingId)
      : await supabase.from("products").insert([payload]);

    if (error) { alert("Error: " + error.message); }
    else { closeModal(); fetchProducts(); }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) { setDeleteConfirm(null); fetchProducts(); }
  };

  const visibleProducts = useMemo(() => {
    setPage(1);
    return products.filter(p => {
      const catOk = filterCategory === "All" || p.category === filterCategory;
      const searchOk = !searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase());
      return catOk && searchOk;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, filterCategory, searchQ]);

  const pagedProducts = useMemo(
    () => visibleProducts.slice((page - 1) * pageSize, page * pageSize),
    [visibleProducts, page, pageSize]
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">Menu Products</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} items in your menu</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-95">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          Add New Item
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" /></svg>
          <input type="text" placeholder="Search products..." value={searchQ} onChange={e => setSearchQ(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all" />
        </div>
        <div className="flex gap-2">
          {["All", ...CATEGORIES].map(cat => (
            <button key={cat} onClick={() => setFilterCategory(cat)} className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${filterCategory === cat ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/60 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Image</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="w-12 h-12 bg-gray-100 rounded-xl animate-pulse" /></td>
                    {Array.from({ length: 4 }).map((__, j) => (
                      <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
                : visibleProducts.length === 0
                  ? (
                    <tr>
                      <td colSpan={5} className="text-center py-16 text-gray-400">
                        <div className="text-4xl mb-2">🍽️</div>
                        <p className="font-bold text-sm">No products found</p>
                      </td>
                    </tr>
                  )
                  : pagedProducts.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/60 transition-colors group">
                      <td className="px-6 py-4">
                        {item.image
                          ? <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-xl bg-gray-100 border border-gray-100" />
                          : <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-400 font-bold">N/A</div>
                        }
                      </td>
                      <td className="px-6 py-4">
                        <h4 className="font-bold text-sm text-gray-900 max-w-[180px] truncate">{item.name}</h4>
                        <p className="text-[11px] text-gray-400 max-w-[180px] truncate mt-0.5">{item.desc}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${categoryColors[item.category] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>{item.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        {item.discount ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-black text-gray-400 line-through leading-none">{item.price}</span>
                            <span className="font-black text-gray-900 text-sm leading-none">${(item.numericPrice * (1 - item.discount / 100)).toFixed(2)}</span>
                            <span className="text-[9px] font-black text-white bg-red-600 px-1.5 py-0.5 rounded w-max mt-0.5">{item.discount}% OFF</span>
                          </div>
                        ) : (
                          <span className="font-black text-gray-900 text-sm">{item.price}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(item)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => setDeleteConfirm(item.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        <Pagination
          total={visibleProducts.length}
          pageSize={pageSize}
          page={page}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">{editingId !== null ? "Edit Product" : "Add New Item"}</h2>
              <button onClick={closeModal} className="p-2 bg-gray-50 rounded-full text-gray-500 hover:text-red-600 transition-colors active:scale-95">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-7 space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Product Name *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Crispy Fried Chicken" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Category *</label>
                  <select value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 transition-all">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Price (USD) *</label>
                  <input required type="number" step="0.01" min="0" value={formData.numericPrice} onChange={e => setFormData(f => ({ ...f, numericPrice: e.target.value }))} placeholder="2.50" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">
                    Discount <span className="normal-case text-gray-300">(%)</span>
                  </label>
                  <div className="relative">
                    <input type="number" step="1" min="1" max="99" value={formData.discount} onChange={e => setFormData(f => ({ ...f, discount: e.target.value }))} placeholder="e.g. 10" className="w-full px-4 py-3 pr-8 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold pointer-events-none">%</span>
                  </div>
                  {formData.discount && formData.numericPrice && (
                    <p className="text-[10px] text-red-600 font-bold mt-1">
                      → ${(Number(formData.numericPrice) * (1 - Number(formData.discount) / 100)).toFixed(2)} after discount
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Product Image</label>
                {formData.image && (
                  <div className="relative mb-2 w-full h-32 rounded-xl overflow-hidden bg-gray-100">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setFormData(f => ({ ...f, image: "" }))} className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full text-white text-xs flex items-center justify-center hover:bg-red-600 transition-colors">✕</button>
                  </div>
                )}
                <label className={`flex items-center gap-3 w-full px-4 py-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-red-400 hover:bg-red-50/30 transition-all ${imageUploading ? "opacity-60 pointer-events-none" : ""}`}>
                  <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="text-sm text-gray-500">{imageUploading ? "Uploading..." : "Click to upload image"}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Description</label>
                <textarea rows={2} value={formData.desc} onChange={e => setFormData(f => ({ ...f, desc: e.target.value }))} placeholder="Short description of the item..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all resize-none" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeModal} className="flex-1 py-3 bg-gray-50 border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors active:scale-95">Cancel</button>
                <button type="submit" disabled={isSubmitting || imageUploading} className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-colors active:scale-95">
                  {isSubmitting ? "Saving..." : editingId !== null ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-7 shadow-2xl max-w-sm w-full text-center">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="font-black text-gray-900 text-lg mb-2">Delete Product?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone. The item will be permanently removed from the menu.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
